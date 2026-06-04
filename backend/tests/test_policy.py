"""
tests/test_policy.py

Testa as regras de negócio puras (REQ03/REQ05/REQ09) — sem banco.
"""

import datetime as dt

from app.services import policy


def test_refund_percentage_boundaries():
    assert policy.refund_percentage(400) == 100  # > 14 dias
    assert policy.refund_percentage(336.1) == 100
    assert policy.refund_percentage(336) == 80  # exatamente 14 dias
    assert policy.refund_percentage(200) == 80  # 7–14 dias
    assert policy.refund_percentage(168) == 80
    assert policy.refund_percentage(100) == 60  # 1–7 dias
    assert policy.refund_percentage(24) == 60
    assert policy.refund_percentage(23) == 40  # < 24h
    assert policy.refund_percentage(0) == 40


def test_is_slot_bookable_8_day_rule():
    now = dt.datetime(2026, 3, 1, tzinfo=dt.UTC)
    bookable = now + dt.timedelta(days=9)
    too_soon = now + dt.timedelta(days=5)
    assert policy.is_slot_bookable(bookable, now) is True
    assert policy.is_slot_bookable(too_soon, now) is False


def test_refund_windows_has_four_periods():
    start = dt.datetime(2026, 3, 19, 8, 0, tzinfo=dt.UTC)
    windows = policy.refund_windows(start)
    assert [w["percentage"] for w in windows] == [100, 80, 60, 40]
    # 100% termina 14 dias antes do início
    assert windows[0]["until"] == start - dt.timedelta(hours=336)


def test_approval_probability():
    assert policy.approval_probability(5.0, 6.0, 7.0) == 60.0
    assert policy.approval_probability(None, None, None) is None
    assert policy.approval_probability(10.0, 10.0, 10.0) == 100.0


def test_parse_dt_handles_z_suffix():
    parsed = policy.parse_dt("2026-03-19T08:00:00Z")
    assert parsed.year == 2026 and parsed.hour == 8
