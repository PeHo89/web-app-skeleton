#!/bin/bash

docker run --name some-mongo -p 27017:27017 -v $PWD/data:/data/db -d mongo