#!/usr/bin/env python3
"""
Convert NYC Subway GTFS to per-route GeoJSON files compatible with this repo's
static map renderer (features with properties.type === "tracks").

Usage examples:
  python gtfs_to_geojson.py --gtfs-url https://rrgtfsfeeds.s3.amazonaws.com/gtfs_subway.zip --out-dir ../lines
  python gtfs_to_geojson.py --gtfs-zip ./gtfs_subway.zip --out-dir ../lines

This will write files like `lineA.json`, `line1.json`, etc. to the output dir.
"""

import argparse
import csv
import io
import json
import os
import sys
import urllib.parse
import urllib.request
import zipfile
from collections import defaultdict


def read_csv_from_zip(zf: zipfile.ZipFile, name: str):
    try:
        with zf.open(name, 'r') as f:
            return list(csv.DictReader(io.TextIOWrapper(f, encoding='utf-8-sig')))
    except KeyError:
        return []


def download_to_bytes(url: str) -> bytes:
    with urllib.request.urlopen(url) as resp:
        return resp.read()


def hex_color(value: str, fallback: str) -> str:
    # GTFS route_color is RGB without '#'. Example: FF0000
    if not value:
        return fallback
    v = value.strip().lstrip('#')
    if len(v) in (3, 6):
        return f"#{v}"
    return fallback


def build_route_shape_map(trips_rows):
    route_id_to_shape_ids = defaultdict(set)
    for row in trips_rows:
        route_id = row.get('route_id')
        shape_id = row.get('shape_id')
        if route_id and shape_id:
            route_id_to_shape_ids[route_id].add(shape_id)
    return route_id_to_shape_ids


def build_shapes(shapes_rows):
    # shape_id -> list of (seq, lat, lon)
    shapes = defaultdict(list)
    for row in shapes_rows:
        sid = row.get('shape_id')
        try:
            seq = int(row.get('shape_pt_sequence') or 0)
            lat = float(row.get('shape_pt_lat'))
            lon = float(row.get('shape_pt_lon'))
        except (TypeError, ValueError):
            continue
        if sid:
            shapes[sid].append((seq, lat, lon))
    # sort and convert to [lon,lat]
    coords = {}
    for sid, pts in shapes.items():
        pts_sorted = sorted(pts, key=lambda x: x[0])
        coords[sid] = [[p[2], p[1]] for p in pts_sorted]
    return coords


def output_route_geojson(out_dir, route_row, shape_ids, shapes_coords):
    route_id = route_row.get('route_id', '').strip()
    short_name = (route_row.get('route_short_name') or route_row.get('route_long_name') or route_id).strip()
    color = hex_color(route_row.get('route_color') or '', '#0039a6')

    features = []
    for sid in shape_ids:
        coords = shapes_coords.get(sid)
        if not coords:
            continue
        features.append({
            "type": "Feature",
            "properties": {
                "type": "tracks",
                "route_id": route_id,
                "route_short_name": short_name,
                "color": color,
            },
            "geometry": {
                "type": "LineString",
                "coordinates": coords,
            },
        })

    if not features:
        return None

    fc = {
        "type": "FeatureCollection",
        "name": f"NYC {short_name}",
        "metadata": {
            "type": "rail-line",
            "color": color,
            "id": f"nyc/{short_name}",
            "name": f"{short_name}",
            "sources": ["MTA GTFS"],
        },
        "features": features,
    }

    # normalize filename: letters/numbers only
    safe = ''.join(c for c in short_name if c.isalnum()) or route_id or 'route'
    filename = f"line{safe}.json"
    out_path = os.path.join(out_dir, filename)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(fc, f, ensure_ascii=False)
    return out_path


def main():
    parser = argparse.ArgumentParser(description='Convert GTFS subway feed to per-route GeoJSON files.')
    parser.add_argument('--gtfs-url', help='URL to GTFS zip (e.g., MTA subway feed)')
    parser.add_argument('--gtfs-zip', help='Local path to GTFS zip')
    parser.add_argument('--out-dir', default='../lines', help='Output directory for GeoJSON files')
    args = parser.parse_args()

    if not args.gtfs_url and not args.gtfs_zip:
        print('Error: Provide either --gtfs-url or --gtfs-zip', file=sys.stderr)
        sys.exit(1)

    os.makedirs(args.out_dir, exist_ok=True)

    if args.gtfs_zip:
        data = open(args.gtfs_zip, 'rb').read()
    else:
        # Basic URL validation
        parsed = urllib.parse.urlparse(args.gtfs_url)
        if not parsed.scheme.startswith('http'):
            print('Error: --gtfs-url must be http(s) URL', file=sys.stderr)
            sys.exit(1)
        print(f'Downloading GTFS from {args.gtfs_url} ...')
        data = download_to_bytes(args.gtfs_url)

    zf = zipfile.ZipFile(io.BytesIO(data))

    routes = read_csv_from_zip(zf, 'routes.txt')
    trips = read_csv_from_zip(zf, 'trips.txt')
    shapes = read_csv_from_zip(zf, 'shapes.txt')

    if not routes or not trips or not shapes:
        print('Error: Missing required GTFS files (routes.txt, trips.txt, shapes.txt).', file=sys.stderr)
        sys.exit(1)

    route_to_shapes = build_route_shape_map(trips)
    shapes_coords = build_shapes(shapes)

    written = 0
    for route_row in routes:
        rid = route_row.get('route_id')
        shape_ids = route_to_shapes.get(rid, set())
        if not shape_ids:
            continue
        out_path = output_route_geojson(args.out_dir, route_row, shape_ids, shapes_coords)
        if out_path:
            written += 1
            print(f'Wrote {out_path}')

    print(f'Done. Wrote {written} route files to {os.path.abspath(args.out_dir)}')


if __name__ == '__main__':
    main()

