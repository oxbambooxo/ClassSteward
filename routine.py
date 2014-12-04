# -*- coding: utf-8 -*-
import threading
import time
import os
import db
import app

def everday_doing():
    while True:
        try:
            time.sleep(43200)
            for i in os.listdir('./static/temp/'):
                if os.path.isfile('./static/temp/'+i):
                    os.remove('./static/temp/'+i)
            with db.new() as cursor:
                cursor.execute('delete from message where flag=1')
                if time.strftime("%w",time.localtime(time.time())) == '0':
                    app.radio_news(1,"todo",'今天是本周最后一天,还没交作业的同学抓紧啦: <a href="/upload">上传作业</a>')
        except:
            return 

everday_doing_thread = threading.Thread(target=everday_doing,name="everday_doing")
everday_doing_thread.setDaemon(True)
everday_doing_thread.start()