# only downloader tasks are done in the functions below

from urllib import request
from urllib.request import Request, urlopen # for get_article_webpage_downloader



def get_page_downloader():
    url = "https://outbreaks.globalincidentmap.com/home.php"
    return request.urlopen(url).read()

# using the difference ID list, append the ID to url and return
# a list of html text dumps containing individual article information
def get_details_list_downloader(difference_list):
    url = "https://outbreaks.globalincidentmap.com/eventdetail.php?ID="
    html_dump_list = []
    print("Found " + str(len(difference_list)) + " pages to crawl")
    count=1
    for ID in difference_list:
        curtr_url = url + str(ID)
        # put a try except block or check if empty string is returned here
        # attatch ID to the html dump, ID used in the data
        html_dump_list.append([request.urlopen(curtr_url).read(), ID])

        print("Downloaded " + str(count) + " of " + str(len(difference_list)))
        count=count+1
    return html_dump_list

# the article websites will kick scrapers, need to fool the security features
# and pretend the request is a request from a user-agent with a browser
# common security feature to avoid bots and scrapersself.
# this is indicated by a 403 error meaning understood request but not fulfill
def get_article_webpage_downloader(url):
    # adds headers to HTTP request to fool server
    try:
        req = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        x = urlopen(req, timeout=20).read()
        return x
    except:
        print("Failed to open url " + url)
        return ""
