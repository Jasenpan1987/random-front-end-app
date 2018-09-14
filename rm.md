# TEG Resale Listing

### Requirements
Python 2.7 (Cannot use python 3 until it is supported by AppEngine standard).
Google Cloud SDK
Google Cloud SDK Python Extras. After installing Cloud SDK run ```gcloud components install app-engine-python-extras```.
NodeJS 8.
Pipenv. Run ```pip install pipenv``` after installing python.

### Run
```
npm install
```
For linux/MacOS please use below npm start script:

"start": "concurrently --kill-others \"pipenv lock --requirements | pip install -U -t vendor/ -r /dev/stdin && dev_appserver.py app.yaml\" \"webpack-dev-server --config configs/webpack.dev.js\"",
For Windows use:

 "start": "concurrently --kill-others \"pipenv lock --requirements > requirements.txt && pip install -U -t vendor/ -r requirements.txt && dev_appserver.py app.yaml\" \"webpack-dev-server --config configs/webpack.dev.js\"",


