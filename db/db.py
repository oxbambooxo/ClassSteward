# -*- coding: utf-8 -*-
import pymysql
import memcache
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
                def new():
                    var=pymysql.connect(host = mysql_['host'], port = mysql_['port'], user = mysql_['user'], passwd = mysql_['passwd'], db = mysql_['db'], autocommit = True, charset = 'utf8')
                    return var
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


#---------- Memcached -------------

with open(cwd + "memcache.ini") as f:
    memcache_ = {i.split('=')[0].strip():i.split('=')[1].strip() for i in f if i.find('#') == -1 and i != '\n'}
    memcache_['host']    = '127.0.0.1' if not 'host' in memcache_.keys() else memcache_['host']
    memcache_['port']    = '11211' if not 'port' in memcache_.keys() else memcache_['port']
    memcache_['maxline'] = '1024' if not 'maxline' in memcache_.keys() else memcache_['maxline']
    memcache_['maxmem']  = '64' if not 'maxmem' in memcache_.keys() else memcache_['maxmem']
    memcache_['reload']  = 'true' if not 'reload' in memcache_.keys() else memcache_['reload']

if memcache_['reload'] == 'true':
    os.system(cwd + "memcached -d stop 2>nul")
    os.system(cwd + "memcached -d uninstall 2>nul")
os.system(cwd + "memcached -d install 2>nul")
os.system(cwd + "memcached -l " + memcache_['host'] + " -p " + memcache_['port'] + " -c " + memcache_['maxline'] + " -m " + memcache_['maxmem'] + " -d start 2>nul")
#memcached -l 127.0.0.1 -p 11211 -c 1024 -m 64
memc = memcache.Client([memcache_['host'] + ':' + memcache_['port']], debug=0)

if __name__ == '__main__':
    try:
        with new() as cursor:
            print('\nconnect mysql success!')
    except:
        print('\nconnect mysql failed!')
    memc.set('one_key', 'the_key', 0)
    # 增加一个键为'one_key'的记录,过期时间为0,即永不过期.
    value = memc.get("one_key")
    if value == 'the_key':
        print('\nconnect memcached success!')
    else:
        print('\nconnect memcached failed!')
    memc.delete('one_key')
