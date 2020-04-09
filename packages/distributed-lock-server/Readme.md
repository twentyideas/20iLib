### Distributed Lock Server
Hosted at: http://20idistributedlock.us-east-2.elasticbeanstalk.com

You can get the adminApiKey from the AWS Elastic Beanstalk software configuration tab
or you can ask wolf. The server code is the backbone for the Distributed lock system.
Since we are using an RDS to faciliate this service, we can scale up to as many servers as
we want.

We might want to use redis for this kind of service later but for now, a 40ms avg response time
is more than good enough.

The server comes with an admin panel hosted at the URL linked above. Please DO NOT DELETE any one
else's project(s) or api key(s)