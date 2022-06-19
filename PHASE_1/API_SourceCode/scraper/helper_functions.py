# contains helper functions

from downloader import *
from parser_local import *
from list_manager import *

#get newest ID
def newest_id():
    return get_new_id_list(get_page_downloader())[-1]
