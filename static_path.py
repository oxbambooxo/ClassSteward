import os


def homework(course, week, class_name, filename):
    return './static/file/homework/'+course+'/'+str(week)+'/'+class_name.encode('utf-8')+'/'+filename.encode('utf-8')

def homework_class(course, week, class_name):
    return './static/file/homework/'+course+'/'+week+'/'+class_name+'/'

def schedule_coursework(filename):
    return'./static/file/schedule/coursework/'+filename.encode('utf-8')

def schedule_courseware(filename):
    return'./static/file/schedule/courseware/'+filename.encode('utf-8')

def teacher_files():
    return [
        (i.decode('utf-8'),
        os.stat('./static/file/teacher/'+i).st_ctime)
        for i in os.listdir('./static/file/teacher')
    ]

