#!/usr/bin/env bash

## Author: https://github.com/EvineDeng
## Modified： 2021-01-24
## Version： v1.0.0

## 网址、路径、文件、标记信息以及表头
WorkDir=$(cd $(dirname $0); pwd)
JsList=($(cd $WorkDir; ls *.js | grep -E "j[drx]_"))
FileReadme=$WorkDir/README.md
UrlBlob=https://github.com/LXK9301/jd_scripts/blob/master/
UrlRaw=https://raw.githubusercontent.com/LXK9301/jd_scripts/master/
SheetHead="| 序号 |   名称  | blob文件链接 | raw文件链接 |\n| ---- | ------- | ------------ | ----------- |"

## 删除标记行的内容
StartLine=$(($(grep -n "标记开始" "$FileReadme" | awk -F ":" '{print $1}') + 1))
EndLine=$(($(grep -n "标记结束" "$FileReadme" | awk -F ":" '{print $1}') - 1))
Tail=$(perl -ne "$. > $EndLine && print" "$FileReadme")
perl -i -ne "{print unless $StartLine .. eof}" "$FileReadme"

## 生成新的表格并写入Readme
cd $WorkDir
Sheet=$SheetHead
for ((i=0; i<${#JsList[*]}; i++)); do
  Name=$(grep "new Env" ${JsList[i]} | awk -F "'|\"" '{print $2}')
  Blob="$UrlBlob${JsList[i]}"
  Raw="$UrlRaw${JsList[i]}"
  Sheet="$Sheet\n| $(($i + 1)) | $Name | [${JsList[i]}]($Blob) | [${JsList[i]}]($Raw) |"
done
echo -e "$Sheet\n$Tail" >> $FileReadme