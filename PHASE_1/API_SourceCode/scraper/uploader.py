

import datetime
import json


# For firestore



def firestore_uploader(obj,db):
    db.collection(u'articles').add(obj)
