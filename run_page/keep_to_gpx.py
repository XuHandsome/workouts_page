import argparse
import json
import os
from collections import namedtuple
from config import GPX_FOLDER
from config import OUTPUT_DIR
from keep_sync import KEEP_SPORT_TYPES, get_all_keep_tracks

"""
从keep导出gpx文件

"""


def run_keep_sync(email, password, keep_sports_data_api, tracks_ids):
    _new_tracks = get_all_keep_tracks(
        email, password, [], tracks_ids, keep_sports_data_api, True
    )
    new_tracks = []
    for track in _new_tracks:
        # By default only outdoor sports have latlng as well as GPX.
        if track.start_latlng is not None:
            file_path = namedtuple("x", "gpx_file_path")(
                os.path.join(GPX_FOLDER, str(track.id) + ".gpx")
            )
        else:
            file_path = namedtuple("x", "gpx_file_path")(None)
        track = namedtuple("y", track._fields + file_path._fields)(*(track + file_path))
        new_tracks.append(track)

    return new_tracks


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("phone_number", help="keep login phone number")
    parser.add_argument("password", help="keep login password")
    parser.add_argument(
        "--sync-types",
        dest="sync_types",
        nargs="+",
        default=["hiking"],
        help="sync sport types from keep, default is running+cycling, you can choose from running, hiking, cycling",
    )
    parser.add_argument(
        "--tracks-ids",
        dest="tracks_ids",
        nargs="+",
        default=[],
        help="appoint list of you want download tracks, default download all",
    )

    options = parser.parse_args()
    for _tpye in options.sync_types:
        assert (
            _tpye in KEEP_SPORT_TYPES
        ), f"{_tpye} are not supported type, please make sure that the type entered in the {KEEP_SPORT_TYPES}"
    # 从keep获取数据
    new_tracks = run_keep_sync(
        options.phone_number, options.password, options.sync_types, options.tracks_ids
    )
