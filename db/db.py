# -*- coding: utf-8 -*-
import pymysql
import os

cwd = os.path.abspath("db/") + '/'
#当前目录是相对于import的app.py而言的
if __name__ == '__main__':
    cwd = os.path.abspath("./") + '/'
    #当直接调用模块时,执行目录为当前目录

#------------ Mysql --------------

with open(cwd + "mysql.ini") as f:
    mysql_ = {i.split('=')[0].strip():i.split('=')[1].strip() for i in f if i.find('#') == -1 and i != '\n'}
    mysql_['host']   = 'localhost' if not 'host' in mysql_.keys() else mysql_['host']
    mysql_['port']   = 3306 if not 'port' in mysql_.keys() else int(mysql_['port'])
    mysql_['user']   = 'root' if not 'user' in mysql_.keys() else mysql_['user']
    mysql_['passwd'] = '' if not 'passwd' in mysql_.keys() else mysql_['passwd']

msql = pymysql.connect(host = mysql_['host'], port = mysql_['port'], user = mysql_['user'], passwd = mysql_['passwd'], autocommit = True, charset = 'utf8')
#msql = pymysql.connect(host = 'localhost', port = 3306, user = 'root', passwd = '', db = 'classsteward', autocommit = True, charset = 'utf8')
with open(cwd + "mysql.sql") as f:
    s=""
    for line in f:
        s+=line
        if line.find(';') != -1:
            if line.find('use ') != -1:
                mysql_['db']=line.split(' ')[1].strip().strip(';')
                def new(**kwargs):
                    kwargs.update({
                        'host': mysql_['host'],
                        'port': mysql_['port'],
                        'user': mysql_['user'],
                        'passwd': mysql_['passwd'],
                        'db': mysql_['db'],
                        'autocommit': True,
                        'charset': 'utf8',
                    })
                    return pymysql.connect(**kwargs)
                msql=new()
            with msql as cursor:
                try:
                    cursor.execute(s)
                except Exception,e:
                    #print e
                    pass
            s=""
del msql
#cursor=msql.cursor(pymysql.cursors.DictCursor)
#DictCursor为字典型cursor,用字典访问result.

if __name__ == '__main__':
    try:
        with new() as cursor:
            print('\nconnect mysql success!')
    except:
        print('\nconnect mysql failed!')

