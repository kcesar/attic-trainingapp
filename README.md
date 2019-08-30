# Environment setup
This guide assumes you have read and completed the guide from the KCSARA [Authentication Portal README](https://github.com/KingCountySAR/sartracks-auth/blob/master/README.md) (up to the "Authentication Server Quick-start)

## Training Portal Quick-start
### Start supporting services
The following services are consumed by this site:
- Authentication at http://localhost:5100 - https://github.com/kingcountysar/sartracks-auth
- Core Database at http://localhost:4944 - https://github.com/mcosand/sar-sites
- Messaging at http://localhost:5200 - https://github.com/kingcountysar/sartracks-messaging

### Verify configuration
An optional file `website\appsettings.local.json` can be used to store configuration values that are specific to your development environment. This file will be ignored by Git. When the site starts it will merge this file into the values set in `website\appsettings.json`.

### Compile and start the site
```
cd sar-sites\kcesar
git clone https://github.com/kcesar/trainingapp trainingapp
cd trainingapp\website
dotnet watch run
```
