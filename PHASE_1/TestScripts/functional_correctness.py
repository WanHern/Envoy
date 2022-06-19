import requests
import itertools
import json


base_api_path = "https://us-central1-seng3011-hi-4.cloudfunctions.net/app/"
endpoint = "reports"

def print_error_report(error_type, expected, actual):
    print("Incorrect return "+error_type + ". Expected: "+ str(expected) +"But received: " + str(actual))

def test(payload, expected_status_code, expected_output):
    r = requests.get(base_api_path + endpoint, params=payload)
    if ( sorted(r.text) != sorted(expected_output) ):
        print_error_report("content", expected_output, r.text)
        if ( r.status_code != expected_status_code):
            print_error_report("code", expected_status_code, r.status_code)
        return 1
    elif ( r.status_code != expected_status_code):
        print_error_report("code", expected_status_code, r.status_code)
        return 1
    print("Test passed")
    return 0

def get_json_from_file(file_name):
    return_array = []
    with open(file_name) as file:
        for line in file:
            return_array.append(line)
    return_string = ''.join(return_array)
    return_json = eval(return_string)
    return return_json



def run_tests(input_file_name, output_file_name):
    failure_count=0
    
    #read all the input values into an array of dictionaries
    
    input_json = get_json_from_file(input_file_name)

    #read all the exptected output values into an array of dictionaries
    expected_outputs_json =  get_json_from_file(output_file_name)

    #zip corresponding input and outputs into a tuple
    tests = zip(input_json, expected_outputs_json)


    for input, output in tests:
        if "input" in input:
            print("test input: "+str(input["details"]))
            failure_count += test(input["input"], output["code"], output["content"])
        else:
            print("test input: "+str(input))
            failure_count += test(input, output["code"], output["content"])
    return (len(expected_outputs_json), failure_count)


if __name__ == "__main__":
    
    #populate_test_cases()
    print("Checking combinations of input keys")
    (key_total,key_failures) = run_tests('test_input_keys.json', 'test_expected_output_keys.json')
    print("Checking validity of input values")
    (value_total, value_failures) = run_tests('test_input_values.json', 'test_expected_output_values.json')

    total_count = key_total+value_total
    failure_count = key_failures+value_failures
    if failure_count == 0:
        print("All tests passed! Awesome!")
    else :
        print(str(total_count - failure_count)+" passed. "+ str(failure_count)+" tests failed. ")

