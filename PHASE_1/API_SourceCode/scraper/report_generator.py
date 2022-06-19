# a set of functions used to generate reports
# use generate_reports to generate reports from the article

from word2number import w2n
import re
import json

# reading disease and syndrome data
syndrome_list_file = open('syndrome_list.json')
SYNDROMES = json.loads(syndrome_list_file.read())

disease_list_file = open('disease_list.json')
DISEASES = json.loads(disease_list_file.read())

# a json of all countries and all corresponding cities
country_city_list_file = open('countries.json')
COUNTRIES = json.loads(country_city_list_file.read())

def generate_reports(event_type, text, location, date):
    # prepare text
    event_type = str(event_type) #event_type is wrapped in a list from previous functions
    text = remove_u(text) # prepare text, convert to utf-8

    event_type_disease = match_diseases(event_type)
    event_type_syndrome = match_syndromes(event_type)
    sections = text.split('and') # split by and

    reports = []
    check_reports = []
    for s_text in sections:
        report = {}
        if is_reports(s_text): # true if the number fo cases is greater than 0
            report['diseases'] = match_diseases(s_text)
            if not report['diseases']:
                report['diseases'] = event_type_disease

            report['syndromes'] = match_syndromes(s_text)
            if not report['syndromes']:
                report['syndromes'] = event_type_syndrome

            report['event_date'] = match_date(s_text, date)

            report['locations'] = match_location(s_text, location)
            # before adding the report to the other list of reports,
            # ensure that the curr report is not a duplicate of other existin reports
            # this occasionally happens due to the nature of splitting main_text
            # by 'and' and using each split text as the source of a potential new report
            flag = 0
            for r in reports:
                if ((set(r['diseases']) == set(report['diseases'])) and
                (set(r['syndromes']) == set(report['syndromes'])) and
                (r['locations']['country'] == report['locations']['country'] and r['locations']['location'] == report['locations']['location'])):
                    flag = 1
            if not flag == 1:
                reports.append(report)

    # 34200-34220

    return reports


# returns a list of syndromes found in text
def match_syndromes(text):
    syndrome_list = []
    for syndrome in SYNDROMES:
        match = re.search(syndrome['name'], text, re.IGNORECASE)
        if match!=None:
            syndrome_list.append(syndrome['name'])
        if 'alt' in syndrome:
            for alt in syndrome['alt']:
                match = re.search(alt, text, re.IGNORECASE)
                if match!=None:
                    syndrome_list.append(syndrome['name'])
    return list(set(syndrome_list))

# returns a list of diseases found in text
def match_diseases(text):
    disease_list = []
    for disease in DISEASES:
        match = re.search(disease['name'], text, re.IGNORECASE)
        if match!=None:
            disease_list.append(disease['name'])
        if 'alt' in disease:
            for alt in disease['alt']:
                match = re.search(alt, text, re.IGNORECASE)
                if match!=None:
                    disease_list.append(disease['name'])
    return list(set(disease_list))

# attempts to find country and city location from text
def match_location(text, location):
    final_country = ""
    final_location = ""
    for country in COUNTRIES:
        match = re.search(country, text, re.IGNORECASE)
        if match!=None:
            final_country = country
            for city in COUNTRIES[country]:
                regex = ' ' + city + ' '
                match = re.search(regex, text, re.IGNORECASE)
                if match!=None and len(city) > 2:
                    final_location = city
                    break
            break

    if final_country == "" and final_location == "":
        return { 'country' : location['country'], 'location' : location['location'] }
    # elif final_country != "" and final_location == "":
    #     return { 'country' : final_country, 'location' : location['location'] }
    # elif final_country == "" and final_location != "":
    #     return { 'country' : location['country'], 'location' : final_location }

    return { 'country' : final_country, 'location' : final_location }

# attempts to find
def match_date(text, date):
    return date

# parses text
def remove_u(text):
    bytes = text.encode('ascii', 'ignore') # removeing unicode escape characters
    utf = bytes.decode('utf-8') # removing the bytes b"" prefix
    utf = utf.lower()
    utf = re.sub("\'", '', utf) # remove these characters
    utf = re.sub("\"", '', utf) # remove these characters
    return utf

# return the first number word found and return it as an int
# otherwise if text contains a one word case word then return one
# else return 0 cases
def is_reports(text):
    text = text.lower() # needed when this fucntion is used independently of generate_reports function
    case_list = []
    case_list.append(0) # at least one element exists in list for return max(cae_list)
    words = text.split(' ')
    for w in words:
        if w in number_list:
            case_list.append(w2n.word_to_num(w))

    for w in words:
        if w in one_case_words:
            case_list.append(1)
    # if for example the text mentions: 39 new cases, then return 39 as
    # the number of new cases
    text = re.sub(',', '', text) # remove any commas e.g. 2,000 => 2000
    # no elif otherwise this whole if elif clause will only add one append to the case_list
    # if numerous if statements this enables all these patterns to add numbers to case_list
    if re.search('\d+ new', text):
        case_list.append(int(re.search('(\d+) new', text).group(1)))
    if re.search('to \d+', text):
        case_list.append(int(re.search('to (\d+)', text).group(1)))
    if re.search('infected \d+', text):
        case_list.append(int(re.search('infected (\d+)', text).group(1)))
    if re.search('killed \d+', text):
        case_list.append(int(re.search('killed (\d+)', text).group(1)))
    if re.search('reporting \d+', text):
        case_list.append(int(re.search('reporting (\d+)', text).group(1)))
    if re.search('reported \d+', text):
        case_list.append(int(re.search('reported (\d+)', text).group(1)))
    if re.search(' \d+ cases', text):
        case_list.append(int(re.search('(\d+) cases', text).group(1)))
    if re.search('reached \d+', text):
        case_list.append(int(re.search('reached (\d+)', text).group(1)))
    if re.search('\d+ confirmed', text):
        case_list.append(int(re.search('(\d+) confirmed', text).group(1)))
    if re.search('\d+ people', text):
        case_list.append(int(re.search('(\d+) people', text).group(1)))
    if re.search('with \d+', text):
        case_list.append(int(re.search('with (\d+)', text).group(1)))

    return max(case_list) # return the largest integer element in list

def get_death_number(text, interval):
    text = re.sub(',', '', text) # remove any commas e.g. 2,000 => 2000
    text = text.lower() # needed when this fucntion is used independently of generate_reports function
    case_list = []
    case_list.append(0) # at least one element exists in list for return max(cae_list)
    words = text.split(' ')
    for i in range(len(words)):
        w = words[i]
        if re.search('died', w) or re.search('deaths', w) or re.search('death', w) or re.search('killed', w) or re.search('kills', w):
            sub_words = []

            # determine start and end indices for slicing words around the 'death' synonym, sliced list is then used to find a number relating to deaths
            index = i
            words_size = len(words)
            start = 0
            end = words_size
            if index > interval:
                start = index - interval
            if (words_size - 1) - index > interval:
                end = index + interval

            sub_words = words[start:end]
            # find the first instance of a number given a "death" synonym exists in the sub list of words
            for s_w in sub_words:
                if s_w in number_list:
                    case_list.append(w2n.word_to_num(s_w))
                    break
                if s_w in one_case_words:
                    case_list.append(1)
                    break
                if re.search('^\d+$', s_w):
                    case_list.append(int(re.search('^(\d+)$', s_w).group(1)))
                    break
    # sanity check removing preposterous numbers
    if max(case_list) > 50000:
        m = max(case_list)
        case_list.remove(m)
    return max(case_list) # return the largest integer element in list

def get_case_number(text, interval):
    text = re.sub(',', '', text) # remove any commas e.g. 2,000 => 2000
    text = text.lower() # needed when this fucntion is used independently of generate_reports function
    case_list = []
    case_list.append(0) # at least one element exists in list for return max(cae_list)
    words = text.split(' ')

    for i in range(len(words)):
        w = words[i]
        if re.search('case', w) or re.search('cases', w) or re.search('tested', w):
            sub_words = []

            # determine start and end indices for slicing words around the 'death' synonym, sliced list is then used to find a number relating to deaths
            index = i
            words_size = len(words)
            start = 0
            end = words_size
            if index > interval:
                start = index - interval
            if (words_size - 1) - index > interval:
                end = index + interval

            sub_words = words[start:end]
            # find the first instance of a number given a "death" synonym exists in the sub list of words
            for s_w in sub_words:
                if s_w in number_list:
                    case_list.append(w2n.word_to_num(s_w))
                    break
                if s_w in one_case_words:
                    case_list.append(1)
                    break
                if re.search('^\d+$', s_w):
                    case_list.append(int(re.search('^(\d+)$', s_w).group(1)))
                    break

    # if nothin is found find any number words and add them to cases
    if max(case_list) == 0:
        for w in words:
            if w in number_list:
                case_list.append(w2n.word_to_num(w))

        for w in words:
            if w in one_case_words:
                case_list.append(1)
    # sanity check removing preposterous numbers
    if max(case_list) > 50000:
        m = max(case_list)
        case_list.remove(m)

    return max(case_list) # return the largest integer element in list

def get_recovery_number(text, interval):
    text = re.sub(',', '', text) # remove any commas e.g. 2,000 => 2000
    text = text.lower() # needed when this fucntion is used independently of generate_reports function
    case_list = []
    case_list.append(0) # at least one element exists in list for return max(cae_list)
    words = text.split(' ')
    for i in range(len(words)):
        w = words[i]
        if re.search('recovery', w) or re.search('recovered', w) or re.search('recover', w) or re.search('discharged', w) or re.search('discharge', w):
            sub_words = []

            # determine start and end indices for slicing words around the 'death' synonym, sliced list is then used to find a number relating to deaths
            index = i
            words_size = len(words)
            start = 0
            end = words_size
            if index > interval:
                start = index - interval
            if (words_size - 1) - index > interval:
                end = index + interval

            sub_words = words[start:end]
            # find the first instance of a number given a "death" synonym exists in the sub list of words
            for s_w in sub_words:
                if s_w in number_list:
                    case_list.append(w2n.word_to_num(s_w))
                    break
                if s_w in one_case_words:
                    case_list.append(1)
                    break
                if re.search('^\d+$', s_w):
                    case_list.append(int(re.search('^(\d+)$', s_w).group(1)))
                    break
    # sanity check removing preposterous numbers
    if max(case_list) > 50000:
        m = max(case_list)
        case_list.remove(m)
    return max(case_list) # return the largest integer element in list

number_list = ['one','two','three','four','five','six','seven','eight','nine','ten',
'eleven',	'twelve',	'thirteen',	'fourteen',	'fifteen',	'sixteen',	'seventeen',	'eighteen',	'nineteen',	'twenty',
'twenty-one',	'twenty-two',	'twenty-three',	'twenty-four',	'twenty-five',	'twenty-six',	'twenty-seven',	'twenty-eight',	'twenty-nine',	'thirty',
'thirty-one',	'thirty-two',	'thirty-three',	'thirty-four',	'thirty-five',	'thirty-six',	'thirty-seven',	'thirty-eight',	'thirty-nine', 'forty',
'forty-one',	'forty-two',    'forty-three',	 'forty-four',	'forty-five',	'forty-six',	'forty-seven',	'forty-eight',	'forty-nine',	'fifty',
'fifty-one',	'fifty-two',    'fifty-three',	'fifty-four',	'fifty-five',	'fifty-six', 'fifty-seven',	'fifty-eight',	'fifty-nine',	'sixty',
'sixty-one',	'sixty-two',	'sixty-three',	'sixty-four',	'sixty-five',	'sixty-six',	'sixty-seven',	'sixty-eight',	'sixty-nine',	'seventy',
'seventy-one',	'seventy-two',	'seventy-three','seventy-four',	'seventy-five',	'seventy-six',	'seventy-seven',	'seventy-eight',	'seventy-nine',	'eighty',
'eighty-one',	'eighty-two',	'eighty-three',	'eighty-four',	'eighty-five',	'eighty-six',	'eighty-seven',	'eighty-eight',	'eighty-nine',	'ninety',
'ninety-one',	'ninety-two',	'ninety-three',	'ninety-four',	'ninety-five',	'ninety-six',	'ninety-seven',	'ninety-eight',	'ninety-nine',	'one hundred'
 ]

one_case_words = ['person', 'man', 'woman', 'patient', 'employee', 'worker', 'confirmed', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'nineth']
