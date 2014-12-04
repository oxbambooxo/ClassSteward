# -*- coding: utf-8 -*-
from json import *
from datetime import datetime
from functools import partial

def date_to_json(object):
    if isinstance(object,datetime):
        return object.strftime('%Y-%m-%d %H:%M:%S')
    raise TypeError(repr(object)+' is not JSON serializable')

dumps=partial(dumps,default=date_to_json)
#用functools模块的偏函数装饰器,固定json的异常处理函数为我们的函数

if __name__ == '__main__':
    date=datetime(2014,8,26,14,9,30)
    print(dumps(date))

