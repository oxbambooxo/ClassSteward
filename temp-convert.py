# -*- coding: utf-8 -*-
import os
from io import open
# python2需要从io导入open()
from functools import reduce

for filename in (i for i in os.listdir('./temp/') if os.path.isfile('./temp/' + i)):
    with open('./temp/' + filename, 'r', encoding="utf-8") as f:
        file = f.read()
    file2 = reduce(lambda x, y: x + y, [file[i] if ord(file[i]) < 255 else '&#' + str(ord(file[i])) + ';' for i in range(len(file))])
    with open('./templates/' + filename, 'w', encoding='utf8') as f:
        f.write(file2)
