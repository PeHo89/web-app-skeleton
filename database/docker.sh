#!/bin/bash

docker run --name some-mongo -v $PWD/data:/data/db -d mongo