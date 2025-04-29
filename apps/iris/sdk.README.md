## Stage 1
1. check the build
2. send the build to fly machines and see it works [at this point you can create multiple machines and share it with folks]


## Stage 2
Set this to work with dashboard


## Stage 3
Convert this to manus like agent

## Stage 5
Launch again on product hunt


SDK(apiKey) -> authorized through openai sdk 
SDK should have sensible defaults [choose the vlm or default to 1.5 tars], choose browser or computer use  etc...

after initialization [create a session]
then sdkInstance.run("do this or that")
sdk.pause()
sdk.terminate()
sdk.resume()



// report upload, users should define url where to send the reports, default should be post := "agent.tryiris.dev/reports" along with initial user command
sdk.setReporting("https://agent.tryiris.dev/reports")

// to create a new task and save to db
sdk.task.create()


sdk.task.get()

sdk.task.delete()


Add components for scraping
Add components for testing

