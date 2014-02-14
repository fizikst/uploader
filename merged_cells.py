#! /usr/bin/env python
#-*- coding: utf-8 -*-

import xlrd
from os import _exit, environ, path, mkdir, stat
import logging
import argparse

def parser(file):
    fileName, fileExtension = path.splitext(_file)
    logger.info('incoming file : ' + fileName + fileExtension)

    if fileExtension == '.xls':
        rb = xlrd.open_workbook('./' + _file, formatting_info=True)
    else:
        rb = xlrd.open_workbook('./' + _file)

    sheet = rb.sheet_by_index(0)

    for rownum in range(sheet.nrows):
	row = sheet.row_values(rownum)
	for c_el in row:
            print c_el

    for crange in sheet.merged_cells:
        rlo, rhi, clo, chi = crange
        for rowx in xrange(rlo, rhi):
            for colx in xrange(clo, chi):
                print rowx, colx


argparser = argparse.ArgumentParser()
argparser.add_argument('-l', '--log')
argparser.add_argument('-f', '--file')
args = argparser.parse_args()

if not args.file:
    print argparser.print_help()
    _exit(1)
else:
    _file = args.file

logger = logging.getLogger('xls_parser')
hdlr = logging.FileHandler('./xls_parser.log')
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
logger.addHandler(hdlr)
logger.setLevel(logging.DEBUG)

try:
    parser(_file)
except Exception, e:
	logger.error(e)
	_exit(1)

_exit(0)
