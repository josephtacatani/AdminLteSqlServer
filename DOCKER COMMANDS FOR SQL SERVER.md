docker exec -u 0 -it sqlserver bash

/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'YourStrong!Passw0rd' -C

docker exec -it sqlserver bash

apt-get update
ACCEPT_EULA=Y apt-get install -y msodbcsql17 unixodbc-dev


FOR BACKUP:

/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'YourStrong!Passw0rd' -C -Q "BACKUP DATABASE [dental_app] TO DISK = '/var/opt/mssql/backup/dental_app_new.bak' WITH FORMAT, INIT"



