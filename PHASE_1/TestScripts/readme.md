# Test Scripts



To run the unit tests, deploy the API then run this in the TestScripts directory
```
python functional_correctness.py
```

The script will automatically run the key tests, then the value tests. At the end it will report how many tests have failed, or if all have passed.



If this error comes up

```
cannot find module '@google/maps'
```

run

```
npm install --save google-maps 
```