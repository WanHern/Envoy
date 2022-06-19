#!./venv/bin/python3

import json
import os
import re
import time

from downloader import *
from parser_local import *
from list_manager import *
from helper_functions import *
from uploader import firestore_uploader

from firebase_admin import db,firestore,credentials,initialize_app
cred = credentials.Certificate('seng3011-hi-4-firebase-key.json')
initialize_app(cred)
firestore_db = firestore.client()

if __name__=="__main__":
    while True:
        print("Enter 1 for periodic updates")
        print("Enter 2 for uploading specified articles")
        print("Enter 3 for deleting internal_list.csv")
        val = int(input("Enter your value: "))
        if val == 1:
            val = int(input("Enter a number of hours to :"))
            hours = val*3600
            while True:
                internal = get_internal_id_list(firestore_db)
                new_detail_id_list = get_new_id_list(get_page_downloader())
                diff = compare_lists(new_detail_id_list, internal)
                article_html_dump_list = get_details_list_downloader(diff)
                article_list = []
                count=1
                print("All page downloaded, now parsing.")
                for article in article_html_dump_list:
                    article_object = get_article_information(article)
                    article_list.append(article_object)
                    firestore_uploader(article_object,firestore_db)
                    print("Parsed and Uploaded " + str(count) + " of " + str(len(article_html_dump_list)))
                    count=count+1

                dump_article_list(article_list)
                # article_list = json.dumps(article_list, indent=4, sort_keys=True)
                append_internal_id_list(diff,firestore_db)
                time.sleep(hours)
        elif val == 2:
            curr = newest_id()
            print("Enter a range: 37-" + str(curr))
            val = input()
            first = int(re.search('(\d*)-\d*',val).group(1))
            second = int(re.search('\d*-(\d*)',val).group(1))
            if second > curr or first > second or first < 37:
                continue
            ID_list = [*range(first, second + 1, 1)] # list of ints
            internal = get_internal_id_list(firestore_db)
            diff = compare_lists(ID_list, internal)


            # main scraper logic:
            article_list = []
            article_html_dump_list = get_details_list_downloader(diff)
            count=1
            for article in article_html_dump_list:
                article_object = get_article_information(article)
                if not article_object == {}:
                    firestore_uploader(article_object,firestore_db)
                    article_list.append(article_object)
                print("Parsed and Uploaded " + str(count) + " of " + str(len(article_html_dump_list)))
                count=count+1
            article_list = json.dumps(article_list, indent=4, sort_keys=True, default=str)
            # print(article_list) # DATA
            # append to internal.csv as a record
            append_internal_id_list(ID_list,firestore_db)
        elif val == 3:
            try:
                os.remove('./internal_list.csv')
            except:
                pass
    #append_internal_id_list([5555,7777])
    # internal = get_internal_id_list()
    # new_detail_id_list = get_new_id_list(get_page_downloader())
    # diff = compare_lists(new_detail_id_list, internal)
    # for d in diff:
    #     print(d)
    #
    # article_html_dump_list = get_details_list_downloader(diff)
    #
    # # list of article/report dictionaries to be converted
    # # to json and sent to API
    # article_list = []
    #
    # for article in article_html_dump_list:
    #     article_list.append(get_article_information(article))
    #
    # article_list = json.dumps(article_list, indent=4, sort_keys=True)
    # print(article_list)
    # # want to append diff to internal after scraping diff webpages are complete
    # #append_internal_id_list(diff)
    # # diff list is given back to a downloader function
