# only html parsing tasks are done in the functions below

from bs4 import BeautifulSoup
import re

import json
from urllib import request
from downloader import get_article_webpage_downloader
from keyword_extractor import get_keywords
from report_generator import generate_reports
from report_generator import get_case_number
from report_generator import get_death_number
from report_generator import get_recovery_number
import datetime

def get_new_id_list(html_dump):
    soup = BeautifulSoup(html_dump, 'html.parser')

    # links of class "b2" contain article data, all links differ by ID + 1
    # <a class="b2" href="eventdetail.php?ID=33833" target="blank">Detail</a>
    # <a class="b2" href="eventdetail.php?ID=33834" target="blank">Detail</a>
    # function gets list of all IDs on web page for last 30 days
    # returns this list for comparision against an internally stored list
    # the difference of these lists represent the new articles that the
    # scraper must return to the API

    detail_links = soup.find_all("a", "b2") # get all links of class "b2"
    mylist = []
    # get IDs from <a> tags via href param
    for a in detail_links:
        mylist.append(int(re.search('ID=(\d*)',a['href']).group(1)))

    # remove duplicate IDs
    # NOTE duplicates exists as we gather all "b2" <a> tags which the latest
    # 50 are repeated once on the site page
    mylist = list(set(mylist))
    return mylist

# takes in a single detail article html dump and returns dictionary in
# specification format, in main.py this dictionary is appended to a
# dictioanry list and converted to json therafter
# NOTE: html_article_and_id_dump is a list of the form: [html_article_dump, ID]
def get_article_information(html_article_and_id_dump):
    html_article_dump = html_article_and_id_dump[0]
    ID = html_article_and_id_dump[1]
    dictionary = {}
    soup = BeautifulSoup(html_article_dump, 'html.parser')
    tds = soup.find_all('td', 'tdline') # date, event , location, link
    divs = soup.find_all('div') # links and article text


    new_format = {}
    # return empty dictionary if url is None
    try:
        dictionary['url'] = tds[13].a['href']
        new_format['url'] = tds[13].a['href']
    except:
        return {}
    dictionary['id'] = ID
    dictionary['date_string'] = re.search('(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})',tds[3].text).group(1)
    dictionary['date_of_publication']=datetime.datetime.strptime(dictionary['date_string'],"%Y-%m-%d %H:%M:%S")
    dictionary['headline'] = divs[0].text.strip()
    dictionary['main_text'] = divs[1].text.strip()
    dictionary['event_type'] = event_type_parser(tds[1].text.strip())
    dictionary['location'] = {
            'country' : tds[5].text.strip(),
            'location' : tds[7].text.strip(),
            'latitude' : tds[9].text.strip(),
            'longitude' : tds[11].text.strip()
    }
    dictionary['keywords'] = get_keywords(tds[1].text.strip(), dictionary['headline'], dictionary['main_text'], tds[5].text.strip(), tds[7].text.strip())
    # In case accessing the actual webpage timesout - moved timeout try catch into lower level function
    # try:
    dictionary['full_text'] = get_article_full_text(get_article_webpage_downloader(tds[13].a['href']))

    dictionary['reports'] = generate_reports(dictionary['event_type'], dictionary['main_text'], dictionary['location'], dictionary['date_string'])

    dictionary['cases'] = get_case_number(dictionary['main_text'], 4) # highest number found in text is the number of cases

    dictionary['deaths'] = get_death_number(dictionary['main_text'], 4) # highest number found in text is the number of deaths

    dictionary['recovered'] = get_recovery_number(dictionary['main_text'], 4) # highest number found in text is the number of recovered
    # except:
        # print("Failed Parsing site with url " + tds[13].a['href'])
        # dictionary['full_text'] = ""
    return dictionary


# gets the html of the actual article website and retrieves the
# full article text
def get_article_full_text(article_webpage_html_dump):
    soup = BeautifulSoup(article_webpage_html_dump, 'html.parser')
    ps = soup.find_all('p')
    text_list = []
    for p in ps:
        text_list.append(p.text)
    final_text = " ".join(text_list)
    return final_text


def event_type_parser(event_string):
    events_array = event_string.split("/")
    return list(map(whitespace_strip,events_array))

def whitespace_strip(string):
    return string.strip()
