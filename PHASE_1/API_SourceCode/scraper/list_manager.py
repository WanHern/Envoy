# only list management tasks are done in the functions below

import csv
import json
import datetime
from firebase_admin import firestore
# For firestore

# returns a list of INT IDs
# Now grabs from firebase
def get_internal_id_list(db):
    dbref = db.collection(u'id_list').document(u'id_list')
    doc = dbref.get().to_dict()
    if (doc==None):
        return []
    
    return doc['ids']


    # id_list = []
    # try:
    #     with open('internal_list.csv', 'r') as csvfile:
    #         my_reader = csv.reader(csvfile)

    #         # each row is an ID but formatted as [ID] need row[0]
    #         for row in my_reader:
    #             id_list.append(int(row[0]))

    #         csvfile.close()
    # except:
    #     return []

    # return id_list

# takes in a list of Integer IDs
# if internal_list.csv does exist then append
# else create and write to the file
def append_internal_id_list(detail_id_list,db):
    dbref = db.collection(u'id_list').document(u'id_list')
    dbref.update({u'ids': firestore.ArrayUnion(detail_id_list)})
    # try:
    #     with open('internal_list.csv', 'a', newline='') as csvfile:
    #         my_writer = csv.writer(csvfile)

    #         for id in detail_id_list:
    #             my_writer.writerow([id])

    #         csvfile.close()
    # except:
    #     print("Error: list_manager.py - append_internal_id_list(): Open Failed")

# compare newly scraped list of IDs to sotred internal list
# return a list of new INT IDs which do not exist in the internal list
def compare_lists(new_external_list, internal_list):
    difference_list = []

    # in case internal_list is empty
    if internal_list == []:
        return new_external_list

    for ID in new_external_list:
        if not (ID in internal_list):
             difference_list.append(ID)
    return difference_list


def dump_article_list(article_list):
    with open('article_list.json', 'a', newline='') as jsonfile:
        for obj in article_list:
            # We can't write datetime objects to JSON
            if 'date_of_publication' in obj:
                del obj['date_of_publication']
            jsonfile.write(json.dumps(obj, indent=4, sort_keys=True))

