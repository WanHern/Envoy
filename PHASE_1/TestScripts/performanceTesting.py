import time
import subprocess

longWait = 3*60 # Three minutes between each call
shortWait = 5

queries = {}

# Generate queries ranging in sizes from 0 to 200
for i in range(0, 210, 10):
    queries[i] = 'https://us-central1-seng3011-hi-4.cloudfunctions.net/app/reports?start_date=2019-03-04T23:54:00&end_date=2021-03-04T23:56:00&key_terms=coronavirus&num='+str(i)

def doActivePerformanceTest():
    startResults = {}
    totalResults = {}    
    # wakeup
    subprocess.check_output('curl -o /dev/null https://us-central1-seng3011-hi-4.cloudfunctions.net/app/reports', shell=True)
    time.sleep(shortWait)

    for val in queries:
        startVal = 0
        totalVal = 0
        # run 3 times to get an average
        for i in range(3):
            time.sleep(shortWait)
            command = 'curl -o /dev/null -w "%{time_starttransfer} %{time_total}" '  + queries[val] 
            result = subprocess.check_output(command, shell=True)
            result = result.decode("utf-8").split(' ')
            result = [float(x) for x in result]
            print(result)
            startVal += result[0]
            totalVal += result[1]
        startResults[val] = startVal/3
        totalResults[val] = totalVal/3
    return startResults, totalResults

def doColdStartPerformanceTest():
    startResults = {}
    totalResults = {}
    for val in queries:
        startVal = 0
        totalVal = 0
        # run 3 times to get an average
        for i in range(3):
            time.sleep(longWait) # wait till the system goes into an inactive state
            command = 'curl -o /dev/null -w "%{time_starttransfer} %{time_total}" '  + queries[val] 
            result = subprocess.check_output(command, shell=True)
            result = result.decode("utf-8").split(' ')
            result = [float(x) for x in result]
            print(result)
            startVal += result[0]
            totalVal += result[1]
        startResults[val] = startVal/3
        totalResults[val] = totalVal/3
    return startResults, totalResults

s, t = doActivePerformanceTest() # 5 seconds between each test, 3 tests per query so 15 seconds per query and 20 total queryes. 
                                 # Total time to run test = 15*20 = 300 seconds = 5 minutes
print('ACTIVE PEFORMANCE TIMES:')
print("\n Time till first byte: ")
print(s)
print("\n Total time: ")
print(t)

s, t = doColdStartPerformanceTest() # 180 seconds between each test, 3 tests per query so 540 seconds per query and 20 total queries. 
                                    # Total time to run test = 540*20 = 10800 seconds = 180 minutes
print('COLD-START PEFORMANCE TIMES:')
print("\n Time till first byte: ")
print(s)
print("\n Total time: ")
print(t)