# -*- coding: utf-8 -*-
from flask import *
from flask.ext.memcache_session import Session
from werkzeug.contrib.cache import MemcachedCache
import random
import db
import routine
import time
import datetime
import jsonfix
from functools import reduce
import os

app = Flask(__name__)

def now():
    return time.strftime('%Y-%m-%d %H:%M:%S',time.localtime(time.time()))

def news(user,origin,type,content):
    '''
    需要推送的消息可以通过这个函数插入消息到数据库
    '''
    with connect() as cursor:
        cursor.execute("insert into messages(user,origin,type,content) value(%d,%d,'%s','%s')"%(user,origin,type,content))

def radio_news(origin,type,content):
    '''
    向所有用户推送消息
    '''
    def radio(origin,type,content):
        with db.new() as cursor:
            cursor.execute("select id from user")
            result = cursor.fetchall()
            i = 0
            for r in result:
                if i%5 == 0:
                    time.sleep(1)
                i += 1
                cursor.execute("select type,content from messages where user=%d order by time desc limit 0,1"%r[0])
                temp = cursor.fetchone()
                if not temp or type.decode('utf8') != temp[0] or content.decode('utf8') != temp[1]:
                    cursor.execute("insert into messages(user,origin,type,content) value(%d,%d,'%s','%s')"%(r[0],origin,type,content))
                if temp and type.decode('utf8') == temp[0] and content.decode('utf8') == temp[1]:
                    cursor.execute("update messages set flag=0,time=now() where user=%d and type='%s' and content='%s'"%(r[0],type,content))
    new=routine.threading.Thread(target=radio,args=(origin,type,content))
    new.setDaemon(True)
    new.start()

datadict={}
def connect():
    if 'db' in session:
        if session['db'] not in datadict:
            datadict[session['db']]=db.new()
        conn=datadict[session['db']]
        conn.ping()
    else:
        conn=db.new()
    return conn

def delete(path):
    try:
        os.remove(path)
    except:
        pass

@app.route('/syllabus/<path>')
@app.route('/syllabus', methods=['GET', 'POST'])
@app.route('/<path>')
@app.route('/')
def syllabus(path='syllabus'):
    if request.method == 'GET':
        # 用file变量获取用户输入的url,可以实现任意后缀访问页面.
        if path.split('.')[0] in ['regist','schedule','download','upload','forum']: 
            return redirect(url_for(path.split('.')[0]))
        course   ={'id':[],'name':[],'class':[],'teacher':[]}
        syllabus ={'id':[],'name':[],'head':[],'detail':[]}
        mesg=None
        with db.new() as cursor:
            cursor.execute("select id,name,class,teacher from course")
            result=cursor.fetchall()
            for r in result:
                course['id'].append(r[0])
                course['name'].append(r[1])
                course['class'].append(r[2])
                course['teacher'].append(r[3])
            cursor.execute("select id,name,head,detail from syllabus")
            result=cursor.fetchall()
            for r in result:
                syllabus['id'].append(r[0])
                syllabus['name'].append(r[1])
                syllabus['head'].append(r[2])
                syllabus['detail'].append(r[3])
        return render_template('syllabus',course=course,syllabus=syllabus)
    if request.method == 'POST' and session['id'] < 500:
        if 'new_syllabus' in request.form:
            with connect() as cursor:
                cursor.execute("insert into syllabus(name,head,detail) value('%s','%s','%s')"%(request.form['name'],request.form['head'],request.form['detail']))
                data = str(cursor.lastrowid)
            radio_news(1,"memo",'老师刚刚更新了课程简介，快去看看吧: <a href="/syllabus">课程简介</a>')
            return data
        if 'delete_syllabus' in request.form:
            with connect() as cursor:
                print "delete from syllabus where id='%s'"%(request.form['id'],)
                cursor.execute("delete from syllabus where id='%s'"%(request.form['id'],))
            return "delete syllabus success"
        if 'modify_syllabus_head' in request.form:
            with connect() as cursor:
                cursor.execute("update syllabus set head='%s' where id='%s'"%(request.form['head'],request.form['id']))
            return "modify syllabus sucess"
        if 'modify_syllabus_detail' in request.form:
            with connect() as cursor:
                cursor.execute("update syllabus set detail='%s' where id='%s'"%(request.form['detail'],request.form['id']))
            return "modify syllabus sucess"

@app.route('/regist', methods=['GET', 'POST'])
def regist():
    if request.method == 'GET':
        if not request.args.get('check', None) and not request.args.get('request',None) and not request.args.get('request_num',None):
            regist={'question':[],'userclass':[]}
            with connect() as cursor:
                cursor.execute("select question from regist")
                result=cursor.fetchall()
                for r in result:
                    regist['question'].append(r[0])
                cursor.execute("select name from class")
                result=cursor.fetchall()
                for r in result:
                    regist['userclass'].append(r[0])
            return render_template('regist',regist=regist,enumerate=enumerate)
        if request.args.get('check', None):
            userinfo = db.memc.get(request.args.get('check').encode('utf-8'))
            #python2.7的python-memcached的键值不能是unicode,需要encode使其知道其编码.
            if userinfo:
                with connect() as cursor:
                    sql="insert into user(name,passwd,account,regist_time,last_time,photo,class,num) value('{}','{}','{}','{}','{}','{}','{}','{}')".format(
                        userinfo["name"].encode('utf-8'), userinfo["passwd"], userinfo["account"].encode('utf-8'), userinfo["regist_time"], userinfo["last_time"], userinfo["photo"], userinfo["class"],userinfo["num"])
                    cursor.execute(sql)
                    cursor.execute("select id,css,class,num,light from user where account='%s'" % userinfo['account'])
                    # 注册时并没有分配id,是自增的.
                    # 为了获得完整的userinfo(包含id),再查询一次.
                    result=cursor.fetchone()
                    userinfo['id']    = result[0]
                    userinfo['css']   = result[1]
                    userinfo['class'] = result[2]
                    userinfo['num']   = result[3]
                    userinfo['light'] = result[4]
                for i in userinfo:
                    session[i]=userinfo[i]
                db.memc.delete(request.args.get('check').encode('utf-8'))
                news(session['id'],1,"mail","欢迎注册 Law&apos;s courses!")
                news(session['id'],1,"agree","欢迎来到 Law&apos;s courses!")
                return render_template('regist', status='success',enumerate=enumerate)
            else:
                return redirect(url_for('regist'))
        if request.args.get('request', None):
            with connect() as cursor:
                status = cursor.execute("select * from user where account=%s"%request.args.get('request'))
                if status != 0:
                    return "the user is exist."
                else:
                    return "the user no exist."
        if request.args.get('request_num',None):
            with connect() as cursor:
                sql="select * from user where class=%s and num=%s"%(request.args.get('request_class'),request.args.get('request_num'))
                status = cursor.execute(sql)
                if status != 0:
                    return "the user is exist."
                else:
                    return "the user no exist."
    if request.method == 'POST':
        regist={'question':[],'answer':[]}
        with connect() as cursor:
            cursor.execute("select question,answer from regist")
            result=cursor.fetchall()
            for r in result:
                regist['question'].append(r[0])
                regist['answer'].append(r[1])
        i=0
        k=1
        while 1:
            if 'question_'+str(i) in request.form:
                j=regist['question'].index(request.form['question_'+str(i)])
                if request.form['answer_'+str(i)] != regist['answer'][j]:
                    k=0
                    break
            else:
                break
            i+=1
        if k==1:
            seed = str(random.randint(1000000000, 9999999999))
            userinfo = {'name':request.form['user_name'],'passwd':request.form['user_passwd'],'account':request.form['user_account'],'regist_time':now(),'last_time':time.strftime('%Y-%m-%d %H:%M:%S',time.localtime(time.time()-60)),'class':request.form['class_name'],'num':request.form['user_num']}
            if request.form['default'] == 0:
                #之前用于在注册时上传头像，现在头像在个人设置处更改
                f = request.files['user_photo']
                f.save('./static/img/photo/' + seed + ".jpg")
                userinfo['photo'] = seed
            else:
                userinfo['photo'] = str(int(seed) % 25)
            db.memc.set(seed, userinfo, 3600)
            return redirect(url_for('regist')+'?check='+seed)
        else:
            return render_template('regist',regist=regist,status='failed',enumerate=enumerate)

@app.route('/logout')
def logout():
    if 'id' in session:
        with connect() as cursor:
            cursor.execute("update user set last_time='%s' where id=%d"%(time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time() - 120)), session['id']))
            if 'db' in session and session['db'] in datadict:
                del datadict[session['db']]
            session.clear()
            return redirect(url_for('syllabus'))
    else:
        return redirect(url_for('syllabus'))

@app.route('/account', methods=['GET', 'POST'])
def account():
    if request.method == 'POST':
        if 'living' in request.form and 'id' in session:
            with db.new() as cursor:
                cursor.execute("update user set last_time=now() where id=%d" %(session['id'],))
                cursor.execute("select count(*) from messages where user=%d and flag=0"%(session['id'],))
                count=cursor.fetchone()[0]
                data=["user is living",count]
                return jsonfix.dumps(data)
        if 'screen' in request.form:
            with connect() as cursor:
                cursor.execute("update user set css='%s' where id=%d"%(request.form['screen'],session['id']))
                session['css']=request.form['screen']
                return "change screen success"
        if 'login' in request.form:
            with db.new() as cursor:
                status = cursor.execute("select name,passwd,id,account,regist_time,last_time,photo,css,class,num,light from user where account='%s' and passwd='%s'"%(request.form['account'], request.form['passwd']))
                if status != 0:
                    result = cursor.fetchone()
                    if time.time() - time.mktime(result[5].utctimetuple()) > 60:
                        session['name']        = result[0]
                        session['passwd']      = result[1]
                        session['id']          = result[2]
                        session['account']     = result[3]
                        session['regist_time'] = result[4]
                        session['last_time']   = result[5]
                        session['photo']       = result[6]
                        session['css']         = unicode(result[7])
                        session['class']       = result[8]
                        session['num']         = result[9]
                        session['light']       = result[10]
                        session['db']          = str(random.randint(1000,9999))
                        return "login success"
                    else:
                        return "login conflict"
                else:
                    return "login failed"


@app.route('/static/font/<path>')
def fontawesomewebfontwoff(path=None):
    '''
    fontawesome.css会向服务器请求一个当前版本的图标文件来显示编辑器控件图标
    我们回应一个我们的图标文件过去
    '''
    try:
        with open('./static/fonts/'+path, 'rb') as f:
            return f.read()
    except:
        return ''

@app.route('/msg')
def msg():
    session['flag'] = 0;
    return render_template('index',msg=0)

@app.route('/message', methods=['GET', 'POST'])
def message():
    if request.method == 'GET' and 'id' in session:
        with connect() as cursor:
            if 'flag' in session and session['flag'] == 0:
                cursor.execute("select (select name from user where id=messages.origin),type,content,time from messages where user='%s' order by id asc"%(session['id'],))
            else:
                cursor.execute("select (select name from user where id=messages.origin),type,content,time from messages where user='%s' and flag=0 order by id asc"%(session['id'],))
            result=cursor.fetchall()
            data=[]
            for r in result:
                data.append(r)
            cursor.execute("update messages set flag=1 where user='%s'"%(session['id'],))
        def generate():
            yield "data:"+jsonfix.dumps(data)+"\n\n"
            #不是用ajax也不是用comet,用html5的服务器推送模式,末尾要加两个\n.
        Return=Response(stream_with_context(generate()), headers = [('Content-Type','text/event-stream; charset=utf-8'),('Cache-Control','no-cache')])
        session['flag'] = 1
        return Return

@app.route('/admin', methods=['GET', 'POST'])
def admin():
    if request.method == 'GET':
        if 'id' not in session or session['id'] >= 500:
            return redirect(url_for('syllabus'))
        if session['id'] < 500:
            regist   ={'question':[],'answer':[],'class':[]}
            forum    ={'name':[],'nickname':[]}
            user_class = []
            userinfo ={'id':[],'account':[],'class':[],'name':[],'regist_time':[],'last_time':[],'num':[]}
            with connect() as cursor:
                cursor.execute("select question,answer from regist")
                result=cursor.fetchall()
                for r in result:
                    regist['question'].append(r[0])
                    regist['answer'].append(r[1])
                cursor.execute("select name from class")
                result=cursor.fetchall()
                for r in result:
                    regist['class'].append(r[0])
                cursor.execute("select name,nickname from forum")
                result=cursor.fetchall()
                for r in result:
                    forum['name'].append(r[0])
                    forum['nickname'].append(r[1])
                cursor.execute("select class from user where id >= 500 group by class")
                result=cursor.fetchall()
                for r in result:
                    user_class.append(r[0])
                cursor.execute("select id,account,class,name,regist_time,last_time,num from user order by class,num")
                result=cursor.fetchall()
                for r in result:
                    userinfo['id'].append(r[0])
                    userinfo['account'].append(r[1])
                    userinfo['class'].append(r[2])
                    userinfo['name'].append(r[3])
                    userinfo['regist_time'].append(r[4])
                    userinfo['last_time'].append(r[5])
                    userinfo['num'].append(r[6])
            return render_template('admin',admin=1,regist=regist,forum=forum,userinfo=userinfo,user_class=user_class)
    if request.method == 'POST' and 'id' in session:
        if "modify_passwd" in request.form:
            with connect() as cursor:
                cursor.execute("update user set passwd='%s' where account='%s'"%(request.form['new_passwd'],request.form['user_account']))
            return "modify passwd success"
        if session['id'] >= 500:
            return "Access denied"
        if "new_forum" in request.form:
            forum_name     = request.form['name']
            forum_nickname = request.form['nickname']
            with connect() as cursor:
                cursor.execute("insert into forum(name,nickname) value('%s','%s')"%(forum_name,forum_nickname))
            return redirect(url_for('admin'))
        if "delete_forum" in request.form:
            with connect() as cursor:
                cursor.execute("delete from forum where name='%s'"%request.form['delete_forum'])
            return "delete forum success"
        if "modify_class" in request.form:
            user_id=request.form['user_id']
            new_class=request.form['new_class'].split()[0]
            old_class=request.form['old_class'].split()[0]
            user_num=request.form['num'].split()[0]
            user_name=request.form['name'].split()[0]
            with connect() as cursor:
                cursor.execute("select course,week,filename from homework where author='%s'"%user_id)
                result=cursor.fetchall()
                for r in result:
                    course=r[0]
                    week=r[1]
                    old_filename=r[2]
                    cursor.execute("select homework from schedule where course='%s' and week='%s'"%(course,week))
                    new_filename=cursor.fetchone()[0].replace('AA',new_class).replace('BB',user_num).replace('CC',user_name)
                    os.renames('./static/file/homework/'+course.encode('gbk')+'/'+str(week)+'/'+old_class.encode('gbk')+'/'+old_filename.encode('gbk'),'./static/file/homework/'+course.encode('gbk')+'/'+str(week)+'/'+new_class.encode('gbk')+'/'+new_filename.encode('gbk'))
                    cursor.execute("update homework set filename='%s' where course='%s' and week='%s' and author='%s'"%(new_filename,course,week,user_id))
                cursor.execute("update user set class='%s' where id='%s'"%(new_class,user_id))
            return "modify class success"
        if "modify_num" in request.form:
            user_id=request.form['user_id']
            new_num=request.form['new_num'].split()[0]
            user_class=request.form['user_class'].split()[0]
            user_name=request.form['name'].split()[0]
            with connect() as cursor:
                cursor.execute("select course,week,filename from homework where author='%s'"%user_id)
                result=cursor.fetchall()
                for r in result:
                    course=r[0]
                    week=r[1]
                    old_filename=r[2]
                    cursor.execute("select homework from schedule where course='%s' and week='%s'"%(course,week))
                    new_filename=cursor.fetchone()[0].replace('AA',user_class).replace('BB',new_num).replace('CC',user_name)
                    os.renames('./static/file/homework/'+course.encode('gbk')+'/'+str(week)+'/'+user_class.encode('gbk')+'/'+old_filename.encode('gbk'),'./static/file/homework/'+course.encode('gbk')+'/'+str(week)+'/'+user_class.encode('gbk')+'/'+new_filename.encode('gbk'))
                    cursor.execute("update homework set filename='%s' where course='%s' and week='%s' and author='%s'"%(new_filename,course,week,user_id))
                cursor.execute("update user set num='%s' where id='%s'"%(new_num,user_id))
            return "modify num success"
        if "modify_name" in request.form:
            user_id=request.form['user_id']
            new_name=request.form['new_name'].split()[0]
            user_class=request.form['user_class'].split()[0]
            num=request.form['num'].split()[0]
            with connect() as cursor:
                cursor.execute("select course,week,filename from homework where author='%s'"%user_id)
                result=cursor.fetchall()
                for r in result:
                    course=r[0]
                    week=r[1]
                    old_filename=r[2]
                    cursor.execute("select homework from schedule where course='%s' and week='%s'"%(course,week))
                    new_filename=cursor.fetchone()[0].replace('AA',user_class).replace('BB',num).replace('CC',new_name)
                    os.renames('./static/file/homework/'+course.encode('gbk')+'/'+str(week)+'/'+user_class.encode('gbk')+'/'+old_filename.encode('gbk'),'./static/file/homework/'+course.encode('gbk')+'/'+str(week)+'/'+user_class.encode('gbk')+'/'+new_filename.encode('gbk'))
                    cursor.execute("update homework set filename='%s' where course='%s' and week='%s' and author='%s'"%(new_filename,course,week,user_id))
                cursor.execute("update user set name='%s' where id='%s'"%(new_name,user_id))
            return "modify name success"
        if "delete_user" in request.form:
            with connect() as cursor:
                cursor.execute("select course,week,(select class from user where id=homework.author),filename from homework where author=(select id from user where account='%s')"%request.form['user_account'])
                result=cursor.fetchall()
                for r in result:
                    path="./static/file/homework/"+r[0].encode('gbk')+'/'+str(r[1])+'/'+r[2].encode('gbk')+'/'+r[3].encode('gbk')
                    delete(path)
                cursor.execute("delete from user where account='%s'"%request.form['user_account'])
            return "delete user success"
        if "new_admin" in request.form:
            with connect() as cursor:
                cursor.execute("select count(*) from user where id < 500")
                count=cursor.fetchone()[0]
                cursor.execute("update user set id=%d where account='%s'"%(count+1,request.form["user_account"]))
                cursor.execute("select id from user where account='%s'"%(request.form["user_account"]))
                user=cursor.fetchone()[0]
                cursor.execute("select id,account,name,regist_time,last_time from user where account='%s'"%(request.form["user_account"]))
                userinfo=cursor.fetchone()
            news(user,1,"attent",'您已被赋为管理员权限: <a href="/schedule">课程管理界面</a>')
            return jsonfix.dumps(userinfo)
        if "cancel_admin" in request.form:
            with connect() as cursor:
                cursor.execute("select max(id) from user")
                user_id=cursor.fetchone()[0]
                user_id=500+user_id if user_id < 500 else user_id+1
                sql="update user set id=%d where account='%s'"%(user_id,request.form["cancel_account"])
                cursor.execute(sql)
            return redirect(url_for('admin')+'#user_admin')
        if "new_question" in request.form:
            with connect() as cursor:
                cursor.execute("insert into regist(question,answer) value('%s','%s')"%(request.form["question"],request.form["answer"]))
            return "new question success"
        if "delete_question" in request.form:
            with connect() as cursor:
                cursor.execute("delete from regist where question='%s'"%request.form["question"])
            return "delete question success"
        if "new_class" in request.form:
            with connect() as cursor:
                cursor.execute("insert into class(name) value('%s')"%(request.form["class"]))
            return "new class success"
        if "delete_class" in request.form:
            with connect() as cursor:
                cursor.execute("delete from class where name='%s'"%request.form["class"])
            return "delete class success"
        if "delete_class_user" in request.form:
            with connect() as cursor:
                cursor.execute("delete from user where class='%s'"%request.form["class"])
            return "delete class user success"

@app.route('/user', methods=['GET', 'POST'])
def user():
    if 'id'not in session:
        return redirect(url_for('syllabus'))
    if request.method == 'GET':
        page = 0
        divide = 20
        if request.args.get('page',None):
            #查询自己已发的帖子
            page = int(request.args.get('page'))
            comment = {'id':[],'src':[],'content':[],'time':[]}
            with connect() as cursor:
                cursor.execute("select id,(select subject from topic where id=c.topic),topic,(select count(*) from comment where topic = c.topic and id <= c.id),left(content,60),last_time,time from comment c where c.author='%s' order by time desc limit %d,%d"%(session['id'],page*divide,divide));
                result = cursor.fetchall()
                for r in result:
                    comment['id'].append(r[0])
                    src = '/forum/'+str(r[1])+'/'+str(r[2])+'?p='+str(r[3])+'#stair_'+str(r[3]%15)
                    comment['src'].append(src)
                    comment['content'].append(r[4])
                    comment_time = r[5] if r[5] and r[5] > r[6] else r[6]
                    comment['time'].append(comment_time)
            return jsonfix.dumps(comment)
        userinfo={}
        comment = {'id':[],'src':[],'content':[],'time':[]}
        with connect() as cursor:
            cursor.execute("select id,account,passwd,class,num,name,regist_time,last_time,photo,light from user where id=%d"%(session['id'],))
            result = cursor.fetchone()
            userinfo = {'id':result[0],'account':result[1],'passwd':result[2],'class':result[3],'num':result[4],'name':result[5],'regist_time':result[6],'last_time':result[7],'photo':result[8],'light':result[9]}
            cursor.execute("select id,(select subject from topic where id=c.topic),topic,(select count(*) from comment where topic = c.topic and id <= c.id),left(content,120),last_time,time from comment c where c.author='%s' order by time desc limit 0,%d"%(session['id'],divide));
            result = cursor.fetchall()
            for r in result:
                comment['id'].append(r[0])
                src = '/forum/'+str(r[1])+'/'+str(r[2])+'?p='+str(r[3])+'#stair_'+str(r[3]%15)
                comment['src'].append(src)
                comment['content'].append(r[4])
                comment_time = r[5] if r[5] and r[5] > r[6] else r[6]
                comment['time'].append(comment_time)
            cursor.execute("select count(*) from comment where author = '%s'"%(session['id'],))
            count = cursor.fetchone()[0]
        return render_template('user',userinfo=userinfo,comment=comment,page=page,divide=divide,count=count,use=1)
    if request.method == 'POST' and 'id' in session:
        if 'light' in request.form:
            with connect() as cursor:
                cursor.execute("update user set light='%s' where id=%d"%(request.form['light'],session['id']))
            session['light']=request.form['light']
            return redirect(url_for('user'))
        if 'modify_photo' in request.form:
            with connect() as cursor:
                cursor.execute("update user set photo='%s' where id=%d"%(request.form['photo'],session['id']))
            return "modify photo success"
        if 'upload_photo' in request.form:
            f = request.files['photo']
            seed = str(random.randint(1000000000,2147483647))
            from PIL import Image
            img = Image.open(f)
            size = (int(request.form['x']),int(request.form['y']),int(request.form['x2']),int(request.form['y2']))
            process_img = img.crop(size).resize((200,200))
            process_img.save("./static/img/photo/"+seed+'.jpg')
            with connect() as cursor:
                cursor.execute("update user set photo='%s' where id=%d"%(seed,session['id']))
            return redirect(url_for('user'))
        if 'delete_user_comment' in request.form:
            with connect() as cursor:
                cursor.execute("select topic,(select count(*) from comment where topic = c.topic) from comment c where id='%s'"%request.form['comment'])
                result = cursor.fetchone()
                topic = result[0]
                count = result[1]
                if count != 1 :
                    cursor.execute("delete from comment where id = '%s'"%request.form['comment'])
                else:
                    cursor.execute("delete from topic where id = '%s'"%topic)
            return "delete comment success"

@app.route('/forum/<subject>/<topic>', methods=['GET', 'POST'])
@app.route('/forum/<subject>', methods=['GET', 'POST'])
@app.route('/forum', methods=['GET', 'POST'])
def forum(subject=999999,topic=None):
    if request.method == 'GET':
        #取得当前subject和论坛表的记录
        with connect() as cursor:
            cursor.execute("select id from forum")
            result=cursor.fetchall()
            count=[]
            for r in result:
                count.append(r[0])
            if not count:
                return redirect(url_for('syllabus'))
            try:
                subject=int(subject)
                if subject not in count:
                    while True :
                        #进入论坛页面时随机切换subject
                        subject=count[random.randint(0,len(count)-1)]
                        if subject !=0 :break
                status=cursor.execute("select id,name from forum where id=%d"%subject)
            except:
                status=cursor.execute("select id,name from forum where name='%s'"%subject)
            if status == 0:
                while True :
                    subject=count[random.randint(0,len(count)-1)]
                    if subject !=0 :break
            else:
                subject=cursor.fetchone()[0]
            cursor.execute("select id,name,nickname from forum")
            result = cursor.fetchall()
            forum  ={'id':[],'name':[],'nickname':[]}
            for r in result:
                forum['id'].append(r[0])
                forum['name'].append(r[1])
                forum['nickname'].append(r[2])
            try:
            #按照论坛还是帖子各自取得当前页码的号数
                topic=int(topic)
                cursor.execute("select count(*) from comment where topic=%d"%topic)
            except:
                topic=None
                cursor.execute("select count(*) from topic where subject=%d"%subject)
            count=cursor.fetchone()[0]
            page = request.args.get('p', 0)
            divide = 15
            try:
                page = int(page)
            except:
                page = 0
            page = 0 if page < 0 else page
            page = page - page % divide if page % divide != 0 else page
            page = count - count % divide if page >= count else page
            if topic:
                #帖子页面:
                cursor.execute("update topic set view=view+1 where subject=%d and id=%d"%(subject,topic))
                cursor.execute("select title,id from topic where subject=%d and id=%d"%(subject,topic))
                result=cursor.fetchone()
                topic={}
                topic['title']=result[0]
                topic['id']=result[1]
                cursor.execute("select id,author,(select photo from user where id=comment.author),(select name from user where id=comment.author),content,time,last_time from comment where topic=%d order by time limit %d,%d"%(topic['id'],page,divide))
                result  =cursor.fetchall()
                comment ={'id':[],'author':[],'author_photo':[],'author_name':[],'content':[],'time':[],'last_time':[]}
                replys={'comment':[],'count':[],'reply':[]}
                for r in result:
                    comment['id'].append(r[0])
                    comment['author'].append(r[1])
                    photo = r[2] if r[2] else '26'
                    comment['author_photo'].append(photo)
                    author = r[3] if r[3] else '&#x8be5;&#x7528;&#x6237;&#x5df2;&#x88ab;&#x5220;&#x9664;'
                    comment['author_name'].append(author)
                    comment['content'].append(r[4])
                    comment['time'].append(r[5])
                    comment['last_time'].append(r[6])
                if len(comment['id']) >= 1:
                    cursor.execute("select id,(select name from user where id=reply.author),content,time,comment from reply where %s order by comment,time"%(reduce(lambda x,y:x+' or '+y,map(lambda x:'comment='+str(x),comment['id']))))
                    result=cursor.fetchall()
                    reply={'id':[],'author':[],'content':[],'time':[]}
                    k=result[0][4] if result else None
                    g=0
                    for i,r in enumerate(result):
                        if k != r[4]:
                            replys['comment'].append(k)
                            replys['count'].append(g)
                            replys['reply'].append(reply)
                            reply={'id':[],'author':[],'content':[],'time':[]}
                            k = r[4]
                            g=0
                        if g < 5:#默认显示前五条评论
                            reply['id'].append(r[0])
                            author = r[1] if r[1] else '&#x8be5;&#x7528;&#x6237;&#x5df2;&#x88ab;&#x5220;&#x9664;'
                            reply['author'].append(author)
                            reply['content'].append(r[2])
                            reply['time'].append(r[3])
                        g+=1
                    replys['comment'].append(k)
                    replys['count'].append(g)
                    replys['reply'].append(reply)
                return render_template('subject',forum=forum,subject=subject,topic=topic,comment=comment,replys=replys,page=page,divide=divide,count=count)
            else:
                #论坛页面:
                cursor.execute('select id,left(title,50),time,last_time,view,total,type,(select (select name from user where id=comment.author) from comment where topic=topic.id and id=(select min(id) from comment where topic=topic.id)),(select name from user where id=topic.last_author),(select author from comment where topic=topic.id and id=(select min(id) from comment where topic=topic.id)) from topic where subject=%d order by type,time desc limit %d,%d'%(subject,page,divide))
                result =cursor.fetchall()
                topic  ={'id':[],'title':[],'time':[],'last_time':[],'view':[],'total':[],'type':[],'author':[],'last_author':[],'author-id':[]}
                for i,r in enumerate(result):
                    topic['id'].append(r[0])
                    topic['title'].append(r[1])
                    topic['time'].append(r[2])
                    topic['last_time'].append(r[3])
                    topic['view'].append(r[4])
                    topic['total'].append(r[5])
                    topic['type'].append(r[6])
                    author = r[7] if r[7] else '&#x8be5;&#x7528;&#x6237;&#x5df2;&#x88ab;&#x5220;&#x9664;'
                    topic['author'].append(author)
                    author = r[8] if r[8] else '&#x8be5;&#x7528;&#x6237;&#x5df2;&#x88ab;&#x5220;&#x9664;'
                    topic['last_author'].append(author)
                    topic['author-id'].append(r[9])
                return render_template('forum',forum=forum,subject=subject,topic=topic,page=page,divide=divide,count=count)
    if request.method == 'POST' and 'id' in session:
        if 'new_topic' in request.form:
            title=request.form['title']
            text=request.form['text'].replace("'","&apos;")
            subject=request.form['subject']
            with connect() as cursor:
                cursor.execute("insert into topic(subject,title,author,last_author,time,last_time) value('%s','%s',%d,%d,'%s','%s')"%(subject,title,session['id'],session['id'],now(),now()))
                topic=cursor.lastrowid
                #topic最后一行的id
                cursor.execute("insert into comment(topic,id,author,content) value(%d,0,%d,'%s')"%(topic,session['id'],text))
                cursor.execute("select count(*) from topic where subject='%s'"%subject)
                count=cursor.fetchone()[0]
                #获得最新的个数使得页面跳转后看到最新发布的帖子,下同.
            return "%d"%count
        if 'new_comment' in request.form:
            text=request.form['text'].replace("'","&apos;")
            topic=request.form['topic']
            with connect() as cursor:
                cursor.execute("insert into comment(topic,author,content) value('%s',%d,'%s')"%(topic,session['id'],text))
                cursor.execute("update topic set total=total+1,last_time=now(),last_author=%d where id='%s'"%(session['id'],topic))
                cursor.execute("select count(*) from comment where topic='%s'"%topic)
                count=cursor.fetchone()[0]
                cursor.execute("select author from comment where id=(select min(id) from comment where topic='%s')"%topic)
                user=cursor.fetchone()[0]
                if user != session['id']:
                    cursor.execute("select subject,left(title,25) from topic where id='%s'"%topic)
                    result=cursor.fetchone()
                    subject=result[0]
                    title=result[1]
                    if len(title) > 80:
                        total=0
                        for i in xrange(100):
                            total=total+1 if ord(title[i]) < 255 else total+2
                            if total >= 25:break
                        title=title[:total]+"..."
                    s=reduce(lambda x,y:str(x)+str(y),("&#"+str(ord(i))+";" for i in title))
                    #MySQLdb不支持unicode编码,所以插入mysql的数据不支持中文,要自己转义.
                    link="/forum/%s/%s?p=%s#stair_%s"%(subject,topic,count,count%15)
                    content=[link,s]
            if user != session['id']:
                news(user,session['id'],"reply",jsonfix.dumps(content))
                #因为news函数里面也用到了connect() as cursor,故在上面的with出来之后再调用较好.
            return "%d"%count
        if 'modify_comment' in request.form:
            text = request.form['text'].replace("'","&apos;")
            with connect() as cursor:
                cursor.execute("update topic set last_time=now(),last_author=%d where id=(select topic from comment where id='%s')"%(session['id'],request.form['id']))
                cursor.execute("update comment set content='%s',last_time='%s' where id='%s'"%(text,now(),request.form['id']))
            return "modify comment success"
        if 'new_reply' in request.form:
            with connect() as cursor:
                text = request.form['content'].replace("'","&apos;")
                cursor.execute("insert into reply(comment,author,content) value('%s','%s','%s')"%(request.form['comment'],session['id'],text))
                cursor.execute("update topic set last_time=now(),last_author=%d where id=(select topic from comment where id='%s')"%(session['id'],request.form['comment']))
                cursor.execute("select author,(select title from topic where id=comment.topic) from comment where id='%s'"%(request.form['comment'],))
                result=cursor.fetchone()
                user=result[0]
                if user != session['id']:
                    title=result[1]
                    if title and len(title) > 80:
                        total=0
                        for i in xrange(100):
                            total=total+1 if ord(title[i]) < 255 else total+2
                            if total >= 25:break
                        title=title[:total]+"..."
                    s=reduce(lambda x,y:str(x)+str(y),("&#"+str(ord(i))+";" for i in title))
                    content=[request.form['href'],s]
            if user != session['id']:
                news(user,session['id'],"reply",jsonfix.dumps(content))
            return "reply comment success"
        if 'delete_topic' in request.form:
            with connect() as cursor:
                cursor.execute("delete from topic where id='%s'"%(request.form['topic']))
            return "delete topic success"
        if 'delete_comment' in request.form:
            with connect() as cursor:
                cursor.execute("update topic set total=total-1 where id=(select topic from comment where id='%s')"%(request.form['comment']))
                cursor.execute("delete from comment where id='%s'"%(request.form['comment']))
            return "delete comment success"
        if session['id'] >= 500:
            return "Access denied"
        if 'delete_reply' in request.form:
            with connect() as cursor:
                cursor.execute("delete from reply where id='%s'"%(request.form['reply']))
            return "delete reply success"
        if "unstar_topic" in request.form:
            with connect() as cursor:
                cursor.execute("update topic set type=100 where id='%s'"%(request.form['topic']))
            return "unstart topic success"
        if "star_topic" in request.form:
            with connect() as cursor:
                cursor.execute("update topic set type=1 where id='%s'"%(request.form['topic']))
            return "start topic success"

@app.route('/reply/<comment>/<page>')
def reply(comment=None,page=None):
    try:
        comment = int(comment) if comment > 0 else None
        page = int(page) if page > 0 else None
    except:
        comment = None
        page = None
    if not comment : return ""
    if request.method == 'GET':
        with connect() as cursor:
            cursor.execute("select id,(select name from user where id=reply.author),content,time from reply where comment=%d order by time limit %d,5"%(comment,(page-1)*5))
            result = cursor.fetchall()
            reply={'id':[],'author':[],'content':[],'time':[]}
            for r in result:
                reply['id'].append(r[0])
                author = r[1] if r[1] else '&#x8be5;&#x7528;&#x6237;&#x5df2;&#x88ab;&#x5220;&#x9664;'
                reply['author'].append(author)
                reply['content'].append(r[2])
                reply['time'].append(r[3])
        return jsonfix.dumps(reply)

@app.route('/schedule/<path>', methods=['GET', 'POST'])
@app.route('/schedule', methods=['GET', 'POST'])
def schedule(path=None):
    if request.method == 'GET':
        course   ={'id':[],'name':[],'class':[],'teacher':[]}
        schedule ={'course':[],'week':[],'date_start':[],'date_end':[],'event':[],'homework':[],'homework_start':[],'homework_end':[],'coursework':[],'courseware':[],'this_week':[]}
        with connect() as cursor:
            cursor.execute("select id,name,class,teacher from course")
            result=cursor.fetchall()
            for r in result:
                course['id'].append(r[0])
                course['name'].append(r[1])
                course['class'].append(r[2])
                course['teacher'].append(r[3])
            cursor.execute("select course,week,date_start,date_end,event,homework,homework_start,homework_end,coursework,courseware from schedule order by week")
            result=cursor.fetchall()
            this_week=datetime.datetime.now()
            for r in result:
                schedule['course'].append(r[0])
                schedule['week'].append(r[1])
                schedule['date_start'].append(r[2].strftime('%Y-%m-%d'))
                schedule['date_end'].append(r[3].strftime('%Y-%m-%d'))
                schedule['event'].append(r[4])
                schedule['homework'].append(r[5])
                schedule['homework_start'].append(r[6])
                schedule['homework_end'].append(r[7])
                courseworklist=[]
                if r[8]:
                    courseworklist=[j for j in r[8].split('|') if j]
                schedule['coursework'].append(courseworklist)
                coursewarelist=[]
                if r[9]:
                    coursewarelist=[j for j in r[9].split('|') if j]
                schedule['courseware'].append(coursewarelist)
                if r[2].date() <= this_week.date() and this_week.date() <= r[3].date()+datetime.timedelta(2):
                    schedule['this_week'].append((r[0],r[1]))
            return render_template('schedule',course=course,schedule=schedule)
    if request.method == 'POST' and 'id' in session and session['id'] < 500:
        if "new_course" in request.form:
            with connect() as cursor:
                sql="insert into course(name,class,teacher) value('%s','%s','%s')"%(request.form['course_name'],request.form['course_class'],request.form['course_teacher'])
                cursor.execute(sql)
            return "new course success"
        if "delete_course" in request.form:
            with connect() as cursor:
                cursor.execute("delete from course where name='%s'"%(request.form['course_name']))
            return "delete course success"
        if "new_schedule" in request.form:
            coursework=''
            for f in request.files.getlist("schedule_work"):
                coursework+='|'+f.filename
                if f.filename:f.save('./static/file/schedule/coursework/'+f.filename.encode('gbk'))
            courseware=''
            for f in request.files.getlist("schedule_ware"):
                courseware+='|'+f.filename
                if f.filename:f.save('./static/file/schedule/courseware/'+f.filename.encode('gbk'))
            with connect() as cursor:
                cursor.execute("insert into schedule(course,week,date_start,date_end,event,homework,homework_start,homework_end,coursework,courseware) value('%s','%s','%s','%s','%s','%s','%s','%s','%s','%s')"%(request.form['course_name'],request.form['schedule_week'],request.form['date_start'],request.form['date_end'],request.form['event'],request.form['homework'],request.form['homework_start'],request.form['homework_end'],coursework,courseware))
            radio_news(1,"plan",'老师刚刚更新了课程进度，快去看看吧: <a href="/schedule">课程进度</a>')
            return redirect(url_for('schedule'))
        if "delete_schedule" in request.form:
            with connect() as cursor:
                cursor.execute("select coursework,courseware from schedule where course='%s' and week='%s'"%(request.form['course_name'],request.form['week']))
                result=cursor.fetchone()
                if result[0]:
                    for i in result[0].split('|'):
                        if i:
                            delete('./static/file/schedule/coursework/'+i)
                if result[1]:
                    for i in result[1].split('|'):
                        if i:
                            delete('./static/file/schedule/courseware/'+i)
                cursor.execute("delete from schedule where course='%s' and week='%s'"%(request.form['course_name'],request.form['week']))
            return "delete schedule success"
        if "modify_schedule_event" in request.form:
            with connect() as cursor:
                cursor.execute("update schedule set event='%s' where course='%s' and week='%s'"%(request.form['event'],request.form['course'],request.form['week']))
            return "modify event success"
        if "modify_schedule_date" in request.form:
            with connect() as cursor:
                cursor.execute("update schedule set date_start='%s',date_end='%s' where course='%s' and week='%s'"%(request.form['date_start'],request.form['date_end'],request.form['course'],request.form['week']))
            return "modify date success"
        if "modify_schedule_homework" in request.form:
            with connect() as cursor:
                cursor.execute("update schedule set homework='%s' where course='%s' and week='%s'"%(request.form['homework'],request.form['course'],request.form['week']))
            return "modify homework success"
        if "modify_schedule_homework_date" in request.form:
            with connect() as cursor:
                cursor.execute("update schedule set homework_start='%s',homework_end='%s' where course='%s' and week='%s'"%(request.form['homework_start'],request.form['homework_end'],request.form['course'],request.form['week']))
            return "modify homework_date sucecss"
        if "addidtion_courseware" in request.form:
            courseware=''
            for f in request.files.getlist("addition_ware"):
                courseware+='|'+f.filename
                if f.filename:f.save('./static/file/schedule/courseware/'+f.filename.encode('gbk'))
            with connect() as cursor:
                cursor.execute("select courseware from schedule where course='%s' and week='%s'"%(request.form['course'],request.form['week']))
                result=cursor.fetchone()[0]
                new_courseware=result+courseware if result!='|' else courseware
                cursor.execute("update schedule set courseware='%s' where course='%s' and week='%s'"%(new_courseware,request.form['course'],request.form['week']))
            return redirect(url_for('schedule'))
        if "addidtion_coursework" in request.form:
            coursework=''
            for f in request.files.getlist("addition_work"):
                coursework+='|'+f.filename
                if f.filename:f.save('./static/file/schedule/coursework/'+f.filename.encode('gbk'))
            with connect() as cursor:
                cursor.execute("select coursework from schedule where course='%s' and week='%s'"%(request.form['course'],request.form['week']))
                result=cursor.fetchone()[0]
                new_coursework=result+coursework if result!='|' else coursework
                cursor.execute("update schedule set coursework='%s' where course='%s' and week='%s'"%(new_coursework,request.form['course'],request.form['week']))
            return redirect(url_for('schedule'))
        if "delete_courseware" in request.form:
            courseware=request.form['courseware']
            with connect() as cursor:
                cursor.execute("select courseware from schedule where course='%s' and week='%s'"%(request.form['course'],request.form['week']))
                old_courseware=[i for i in cursor.fetchone()[0].split('|') if i]
                old_courseware.remove(courseware)
                delete('./static/file/schedule/courseware/'+courseware.encode('gbk'))
                new_courseware=''
                for i in old_courseware:
                    new_courseware+='|'+i
                cursor.execute("update schedule set courseware='%s' where course='%s' and week='%s'"%(new_courseware,request.form['course'],request.form['week']))
            return "delete courseware success"
        if "delete_coursework" in request.form:
            coursework=request.form['coursework']
            with connect() as cursor:
                cursor.execute("select coursework from schedule where course='%s' and week='%s'"%(request.form['course'],request.form['week']))
                old_coursework=[i for i in cursor.fetchone()[0].split('|') if i]
                old_coursework.remove(coursework)
                delete('./static/file/schedule/coursework/'+coursework.encode('gbk'))
                new_coursework=''
                for i in old_coursework:
                    new_coursework+='|'+i
                cursor.execute("update schedule set coursework='%s' where course='%s' and week='%s'"%(new_coursework,request.form['course'],request.form['week']))
            return "delete coursework success"
        if "delete_homework" in request.form:
            with connect() as cursor:
                cursor.execute("update schedule set homework='' where course='%s' and week='%s'"%(request.form['course'],request.form['week']))
            return "delete homework success"


@app.route('/download', methods=['GET', 'POST'])
def download():
    if request.method == 'GET':
        f=[(i.decode('gbk'),os.stat('./static/file/teacher/'+i).st_ctime) for i in os.listdir('./static/file/teacher')]
        f.sort(lambda x,y:int(y[1]-x[1]))
        for i,j in enumerate(f):
            f[i] = j[0],time.strftime('%Y-%m-%d %H:%M:%S',time.localtime(j[1]))
        return render_template('download',teacher_file=f)

@app.route('/upload', methods=['GET', 'POST'])
def upload():
    if request.method == 'GET':
        if 'id' in session and session['id'] >= 500:
            with connect() as cursor:
                cursor.execute("select (select id from course where name=homework.course),course,week,(select class from user where id=%d),filename,time,total,score from homework where author=%d"%(session['id'],session['id']))
                result=cursor.fetchall()
                homework={'course_id':[],'course':[],'week':[],'class':[],'filename':[],'time':[],'total':[],'score':[]}
                for r in result:
                    homework['course_id'].append(r[0])
                    homework['course'].append(r[1])
                    homework['week'].append(r[2])
                    homework['class'].append(r[3])
                    homework['filename'].append(r[4])
                    homework['time'].append(r[5])
                    homework['total'].append(r[6])
                    homework['score'].append(r[7])
            return render_template('upload',homework=homework)
        if 'id' in session and session['id'] < 500:
            return redirect(url_for('filemanage'))
        else:
            return render_template('upload')

@app.route('/filemanage', methods=['GET', 'POST'])
def filemanage():
    if request.method == 'GET':
        if 'id' in session and session['id'] < 500:
            course_name=[]
            user_class=[]
            user={'class':[],'num':[],'name':[]}
            with connect() as cursor:
                cursor.execute("select name from course")
                result=cursor.fetchall()
                for r in result:
                    course_name.append(r[0])
                cursor.execute("select class from user where id>=500 group by class")
                result=cursor.fetchall()
                for r in result:
                    user_class.append(r[0])
            return render_template('filemanage',course=course_name,user_class=user_class)
        else:
            return render_template('filemanage')

@app.route('/file', methods=['GET', 'POST'])
def file():
    if 'id' not in session:
        return ""
    if request.method == 'GET':
        if request.args.get('schedule',None):
            with connect() as cursor:
                cursor.execute("select class from user where id=%d"%(session['id'],))
                user_class=cursor.fetchone()[0]
                cursor.execute("select (select id from course where name=schedule.course),course,week,homework from schedule where homework!='' and now()>homework_start and now()<homework_end and course in (select name from course where class like '%%%s%%') order by course"%(user_class))
                #之前时间没有精确到分秒的时候是00:00，所以需要往后加一天date_add(homework_end,interval 1 day)
                result=cursor.fetchall()
                schedule={'course_id':[],'course':[],'week':[],'homework':[]}
                for r in result:
                    schedule['course_id'].append(r[0])
                    schedule['course'].append(r[1])
                    schedule['week'].append(r[2])
                    num=str(session['num']) if session['num'] > 10 else '0'+str(session['num'])
                    schedule['homework'].append(r[3].replace('AA',str(session['class'])).replace('BB',num).replace('CC',session['name']))
                return jsonfix.dumps(schedule)
    if request.method == 'POST':
        if "homework" in request.files:
            course=request.form['course']
            week=request.form['week']
            filename=request.form['homework_name']
            f = request.files['homework']
            if not os.path.exists('./static/file/homework/'+course):
                os.makedirs('./static/file/homework/'+course)
            if not os.path.exists('./static/file/homework/'+course+'/'+week):
                os.makedirs('./static/file/homework/'+course+'/'+week)
            if not os.path.exists('./static/file/homework/'+course+'/'+week+'/'+session['class']):
                os.makedirs('./static/file/homework/'+course+'/'+week+'/'+session['class'])
            f.save('./static/file/homework/'+course+'/'+week+'/'+session['class']+'/'+filename)
            with connect() as cursor:
                status = cursor.execute("select * from homework where course='%s' and week='%s' and author=%d"%(course,week,session['id']))
                if status != 0:
                    cursor.execute("update homework set time=now(),total=total+1,filename='%s' where course='%s' and week='%s' and author=%d"%(filename,course,week,session['id']))
                else:
                    cursor.execute("insert into homework(course,week,author,filename) value('%s','%s',%d,'%s')"%(course,week,session['id'],filename))
            return redirect(url_for('upload'))
        if session['id'] >= 500:
            return "Student HomeWork Page"
        if "teacher_file" in request.files:
            for f in request.files.getlist("teacher_file"):
                #request.files.getlist获取files数组的文件列表
                f.save('./static/file/teacher/'+f.filename)
                s=reduce(lambda x,y:str(x)+str(y),("&#"+str(ord(i))+";" for i in f.filename))
                radio_news(1,"file","老师上传了新的共享文件: "+s)
            return redirect(url_for('download'))
        if "delete_file" in request.form:
            filename=request.form['file_name']
            delete('./static/file/teacher/'+filename)
            return "delete file success"
        if "delete_homework" in request.form:
            course=request.form['course']
            week=request.form['week']
            user_class=request.form['class']
            filename=request.form['filename']
            delete('./static/file/homework/'+course+'/'+week+'/'+user_class+'/'+filename)
            with connect() as cursor:
                cursor.execute("delete from homework where filename='%s'"%filename)
            return "delete homework success"
        if "score_homework" in request.form:
            with connect() as cursor:
                cursor.execute("update homework set score='%s' where filename='%s'"%(request.form['score'],request.form['filename']))
            return "score homework success"
        if "request" in request.form:
            path=request.form['path']
            pathlist=path.split('/')
            file_total={"filename":[],"time":[],"flag":[],"num":[],"push_total":[],"score":[]}
            class_total=0
            if len(pathlist) == 4:
                course=pathlist[0]
                week=pathlist[1]
                user_class=pathlist[2]
                with connect() as cursor:
                    status = cursor.execute("select num,name,(select total from homework where course='%s' and week='%s' and author=user.id),\
                                                        (select score from homework where course='%s' and week='%s' and author=user.id),\
                                                        (select filename from homework where course='%s' and week='%s' and author=user.id),\
                                                        (select time from homework where course='%s' and week='%s' and author=user.id)\
                                                        from user where class='%s'"%(course,week,course,week,course,week,course,week,user_class))
                    if status:
                        user=cursor.fetchall()
                        class_total=len(user)
                        status = cursor.execute("select homework from schedule where course='%s' and week='%s'"%(course,week))
                        if status:
                            filename=cursor.fetchone()[0]
                            for i,u in enumerate(user):
                                num=str(u[0]) if u[0] > 10 else '0'+str(u[0])
                                file_total["filename"].append(filename.replace('AA',user_class).replace('BB',num).replace('CC',u[1]))
                                file_total["num"].append(u[0])
                                file_total["push_total"].append(u[2])
                                file_total["score"].append(u[3])
                                flag = 'do' if u[4] else 'undo'
                                file_total["flag"].append(flag)
                                file_total["time"].append(u[5])
            try:
                path="./static/file/homework/"+path
                path_dir=[i for i in os.listdir(path) if os.path.isdir(path+i)]
                data={"dir":path_dir,"class_total":class_total,"file_total":file_total}
                return jsonfix.dumps(data)
            except Exception as e:
                return ""
                #在file.js第一次请求时会带有一个空的文件夹请求,except以避免raise WindowsError
        if "download" in request.form:
            import tarfile
            cwd=os.getcwd()
            path='./static/file/homework/'+request.form['course']+'/'+request.form['week']+'/'+request.form['class']+'/'
            tarname="./static/temp/"+request.form['course']+"_第".decode('utf8')+request.form['week']+"周_".decode('utf8')+request.form['class']+"班.tar.gz".decode('utf8')
            tar=tarfile.open(tarname.encode('gbk'),"w:gz")
            for i in os.listdir(path):
                tar.add(path+i,arcname=i)
            tar.close()
            return "files is compress sucess"
        if 'delete_directory' in request.form:
            import shutil
            shutil.rmtree('./static/file/homework/'+request.form['path'].encode('gbk'))
            return "delete directory success"

@app.route('/draw', methods=['GET', 'POST'])
def draw():
    if request.method == 'POST' and 'id' in session and session['id'] < 500:
        if 'request' in request.form:
            user={'class':[],'num':[],'name':[],'id':[]}
            with connect() as cursor:
                cursor.execute("select class,num,name,id from user where id>=500 order by class,num")
                result=cursor.fetchall()
                for r in result:
                    user['class'].append(r[0])
                    user['num'].append(r[1])
                    user['name'].append(r[2])
                    user['id'].append(r[3])
            return jsonfix.dumps(user)
        if 'draw_course' in request.form:
            course=request.form['course']
            class_list=request.form['class'].split(',')
            class_sql=reduce(lambda x,y:x+' or '+y,map(lambda x:"class='"+str(x)+"'",class_list))
            draw_data=[]
            with connect() as cursor:
                sql="select (select class from user where id=h.author) as class,sum(score)/count(*) from homework as h where score is not null and course='"+course+"' group by week,class having "+class_sql+" order by class,week"
                #class,score
                cursor.execute(sql)
                result=cursor.fetchall()
                k=result[0][0] if result else None
                t={'class':[],'score':[]}
                for r in result:
                    if k!=r[0]:
                        t['class'].append(k)
                        draw_data.append(t)
                        k=r[0]
                        t={'class':[],'score':[]}
                    t['score'].append(int(r[1]))
                t['class'].append(k)
                draw_data.append(t)
            return jsonfix.dumps(draw_data)
        if 'draw_class' in request.form:
            user_class=request.form['class']
            course_list=request.form['course'].split(',')
            course_sql=reduce(lambda x,y:x+' or '+y,map(lambda x:"course='"+x+"'",course_list))
            draw_data=[]
            with connect() as cursor:
                sql="select course,name,sum(score)/count(*) from user as u, homework as h where h.author = u.id and u.class = '"+user_class+"' group by name, course having "+course_sql+" order by course,num"
                # course,name,score
                cursor.execute(sql)
                result=cursor.fetchall()
                k=result[0][0] if result else None
                t={'course':[],'name':[],'score':[]}
                for r in result:
                    if k!=r[0]:
                        t['course'].append(k)
                        draw_data.append(t)
                        k=r[0]
                        t={'course':[],'name':[],'score':[]}
                    t['name'].append(r[1])
                    score=int(r[2]) if r[2] else 0
                    t['score'].append(score)
                t['course'].append(k)
                draw_data.append(t)
            return jsonfix.dumps(draw_data)
        if 'draw_user' in request.form:
            user=request.form['user']
            course_list=request.form['course'].split(',')
            course_sql=reduce(lambda x,y:x+' or '+y,map(lambda x:"course='"+x+"'",course_list))
            draw_data=[]
            with connect() as cursor:
                sql="select course,score from homework as h where author="+user+" and "+course_sql+" order by course,week"
                #course,score
                cursor.execute(sql)
                result=cursor.fetchall()
                k=result[0][0] if result else None
                t={'course':[],'score':[]}
                for r in result:
                    if k!=r[0]:
                        t['course'].append(k)
                        draw_data.append(t)
                        k=r[0]
                        t={'course':[],'score':[]}
                    score=int(r[1]) if r[1] else 0
                    t['score'].append(score)
                t['course'].append(k)
                draw_data.append(t)
            return jsonfix.dumps(draw_data)

#@app.errorhandler(400)
#@app.errorhandler(401)
#@app.errorhandler(403)
#@app.errorhandler(404)
#@app.errorhandler(500)

app.secret_key = 'Sz@rkrty#$X^R~o&H!=N{]}L*/.?RT'
app.cache = MemcachedCache([db.memcache_['host'], db.memcache_['port']])
app.session_interface = Session()
#将flask的session存储方式改为在memcached中,不采用默认的客户端存储方式.

if __name__ == '__main__':
    app.config['DEBUG'] = True
    app.run(host="0.0.0.0", port=8085)
else:
    app.config['DEBUG'] = False
