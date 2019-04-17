#!/bin/bash

ENV=".venv"

virtualenv ../"$ENV"
../"$ENV"/bin/pip3 install -r requirements.txt

