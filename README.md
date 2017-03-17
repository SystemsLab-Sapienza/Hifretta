**Authors:** *[Simone Ferretti](https://github.com/shikan91), [Eugenio Nemmi](https://github.com/EugenioNemmi), [Massimo La Morgia](https://github.com/Ansijax), [Daniele Mattiacci](https://github.com/danielemattiacci)*


# HiFretta Facebook Bot

HiFretta! Roma bus is a Facebook bot developed to provide informations about buses waiting time and ATAC line.
The whole project is developed in nodeJS, using Facebook's Graph API ([documentation](https://developers.facebook.com/docs/graph-api/webhooks/)).

The Graph API owns Webhooks feature (formerly known as real-time updates), which allows you to enter the app to the receipt of the modifications applied to certain data, receiving real-time updates. When a change occurs, it sends a HTTP POST request to a callback URL of the app. In this way, the apps are more efficient because they know exactly when changes happen, without sending requests Graph API continuously or periodically.

HiFretta runs on [Heroku](https://www.heroku.com/what) server, a cloud platform as a service (PaaS), whom documentation can be found [here](https://devcenter.heroku.com).
To develop on Heroku platform, you need an Heroku account (you can register [here](https://signup.heroku.com/login?redirect-url=https%3A%2F%2Fid.heroku.com%2Foauth%2Fauthorize%3Fclient_id%3Da6a60ed2-c057-4b3e-82ca-fe9405381b2c%26response_type%3Dcode%26scope%3Dglobal%252Cplatform%26state%3DFe26.2**bf6e15aa67f7c73a922f8a1389ae5e5416ec1358426ebe3e60dc827fb95d8d14*8-Z4Wjl9Hix-KXsk7FIeFQ*Kb13RbsvQP9bFQheA_usZufC_W5Uhh8oD2Cs6Ox4gwraNOrDSFBclPMhNbzm1R96yB0r_fHxblzQOR0ZpX2cdA*1487363812289*3346b618f24186f14f39182c1dd587e810bb978907670bc179893ff78541dee2*dIT5GZpTEP3SGjxYCc5JQW_lGb3X1USl7h02GdacotQ)) and a dev key, easily obtainable from your account settings.

To connect our Facebook application to Heroku server, we use access token provided by Facebook. The token is in the Setting page inside Messenger Tab which can be found in Facebook's Application Manager. Here, choosing target Facebook's page, you can obtain the needed access token.



## How to use HiFretta

1. Search the HiFretta Facebook's Page ([link](https://www.facebook.com/HiFrettaBot/?fref=ts))
1. Click on button "Send a message"
1. Start the conversation with this bot to obtain the informations that you want.


### How to retrieve information from HiFretta

The user can send to HiFretta:

* the id number of bus'stop to obtain waiting time of all busses that stop there.

* your current position to check the nearest 10 bus's stop

* a number of bus to obtain the list of all stop of that bus.




You can obtain the whole list of commands sending words like "*help*" or "*hello*".

The following gif shows the main features of this bot:

![Image is not available](https://dl2.pushbulletusercontent.com/0LRTXEYVAndRoMyLrljGH6yqhpc6OjHx/ezgif.com-resize-2.gif)

## How to develop an Heroku Application

After creating an Heroku account, you can create an application from its internal dashboard.

At this point you can choose the deployment method:

* Heroku Git, using Heroku CLI
* GitHub, by connecting your application to a GitHub repositoty
* Dropbox, connecting your Dropbox account


Finally, you can test and use your application going to the website https://your_application_name.herokuapp.com.


### How to install Heroku CLI


The Heroku Command Line Interface (CLI), formerly known as the Heroku Toolbelt, is a tool for creating and managing Heroku apps from the command line / shell of various operating systems.

##### OS X with Homebrew

```bash
brew install heroku
```

##### OS X Installer

Download and run the [OS X Installer](https://cli-assets.heroku.com/branches/stable/heroku-osx.pkg).

##### Windows

Download and run the Windows installer [32-bit](https://cli-assets.heroku.com/branches/stable/heroku-windows-386.exe) [64-bit](https://cli-assets.heroku.com/branches/stable/heroku-windows-amd64.exe).


##### Debian/Ubuntu

Run the following to add our apt repository and install the CLI:

```bash
sudo apt-get install software-properties-common # debian only
sudo add-apt-repository "deb https://cli-assets.heroku.com/branches/stable/apt ./"
curl -L https://cli-assets.heroku.com/apt/release.key | sudo apt-key add -
sudo apt-get update
sudo apt-get install heroku
```

#### Getting Started

Login in Heroku system typing the terminal command
```bash
heroku login
```
and type your credential.
Then you log in Heroku system and can clone your application on your PC, typing
```bash
heroku git:clone -a your_application_name
cd your_application_name
```
Now you can develop your application in local and deploy it on Heroku platform with command
```bash
git add .
git commit -am "your commit message"
git push heroku master
```
