"""
CSV import/export utilities
"""
import csv
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any


def read_csv(filepath: str) -> List[Dict[str, Any]]:
    """Read CSV file and return list of dictionaries"""
    rows = []
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)
    return rows


def parse_bool(value: str) -> bool:
    """Parse string to boolean"""
    return value.strip().lower() in ('1', 'true', 'yes', 't', 'y')


def parse_float(value: str) -> float:
    """Parse string to float, handling empty values"""
    try:
        return float(value.strip())
    except (ValueError, AttributeError):
        return 0.0


def parse_int(value: str) -> int:
    """Parse string to int, handling empty values"""
    try:
        return int(value.strip())
    except (ValueError, AttributeError):
        return 0


def parse_date(value: str):
    """Parse string to date, handling empty values"""
    if not value or value.strip() == '':
        return None
    try:
        return datetime.strptime(value.strip(), '%Y-%m-%d').date()
    except ValueError:
        return None


def write_csv_from_dicts(filepath: str, data: List[Dict[str, Any]], fieldnames: List[str]):
    """Write list of dictionaries to CSV file"""
    with open(filepath, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)
