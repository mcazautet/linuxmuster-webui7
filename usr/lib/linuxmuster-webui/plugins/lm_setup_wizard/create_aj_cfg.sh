#!/bin/bash
setupini="/var/lib/linuxmuster/setup.ini"
ajtemplate="/usr/lib/linuxmuster-webui/plugins/lm_setup_wizard/template.yml"
ajcfg="/etc/ajenti/config.yml.testing"

basedn=$(cat $setupini |  grep basedn | awk '{print $3}')
bindpw=$(cat /etc/linuxmuster/.secret/global-binduser)
binduser=CN=global-binduser,OU=Management,OU=GLOBAL,$basedn
language=$(cat $setupini |  grep country | awk '{print $3}')
servername=$(cat $setupini |  grep servername | awk '{print $3}')
domainname=$(cat $setupini |  grep domainname | awk '{print $3}')

rm $ajcfg
cp $ajtemplate $ajcfg

sed -i s/%%BINDUSER%%/$binduser/ $ajcfg
sed -i s/%%BINDPW%%/$bindpw/ $ajcfg
sed -i s/%%BASEDN%%/$basedn/ $ajcfg
sed -i s/%%LANGUAGE%%/$language/ $ajcfg
sed -i s/%%SERVERNAME%%/$servername/ $ajcfg
sed -i s/%%DOMAINNAME%%/$domainname/ $ajcfg

#touch /etc/linuxmuster/sophomorix/default-school/students.csv
#touch /etc/linuxmuster/sophomorix/default-school/teachers.csv
#touch /etc/linuxmuster/sophomorix/default-school/devices.csv
#touch /etc/linuxmuster/sophomorix/default-school/extrastudents.csv