# Environment setup
This guide assumes you have read and completed the guide from the KCSARA [Authentication Portal README](https://github.com/KingCountySAR/sartracks-auth/blob/master/README.md) (up to the "Authentication Server Quick-start)

## Training Portal Quick-start
### Start supporting services
The following services are consumed by this site:
- Authentication at http://localhost:5100 - https://github.com/kingcountysar/sartracks-auth
- Core Database at http://localhost:4944 - https://github.com/mcosand/sar-sites
- Messaging at http://localhost:5200 - https://github.com/kingcountysar/sartracks-messaging

### Compile and start the site
```
cd sar-sites\kcesar
git clone https://github.com/kcesar/trainingapp trainingapp
cd trainingapp\website
dotnet watch run
```

### Verify configuration
Out of the box, the site has a configuration that uses a SQLite database and depends on local copies of the supporting services. An optional file `website\appsettings.local.json` can be used to store configuration values that are specific to your development environment, allowing you to point to a different database or already running instances of the services. This file will be ignored by Git. When the site starts it will merge this file into the values set in `website\appsettings.json`.

The site needs to be restarted when changes are made to the `appsettings.local.json` file.

When running on a SQLite database (vs MS SQL Server), you do not get the benefit of database migrations. If the schema changes you'll need to delete your database (training-store.db by default) and re-create it.