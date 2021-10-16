[https://docs.microsoft.com/en-us/ef/core/managing-schemas/migrations/providers?tabs=dotnet-core-cli]

```
dotnet ef migrations add InitialCreate --context ApplicationDbContext --output-dir Migrations/Sqlite -- --SqlProvider Sqlite
dotnet ef migrations add InitialCreate --context SqlServerApplicationDbContext --output-dir Migrations/SqlServer -- --SqlProvider
```

```
dotnet ef database update --context ApplicationDbContext
dotnet ef database update --context SqlServerApplicationDbContext -- --SqlProvider SqlServer
```


Configuration:
 "ConfigurationStrings:DefaultConnection": "",
 "ConfigurationStrings:SqlServerConnection": "",
 "SqlProvider": "SqlServer"|"Default"

 If SqlServerConnection is present, use SQL Server as provider unless SqlProvider is set to Sqlite