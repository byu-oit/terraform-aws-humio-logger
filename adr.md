# ADR

Approved by: Blake Morgan, Josh Gubler, Scott Hutchings
Approved on: 2021-07-16

## Options

1. A single Lambda and CloudWatch group per AWS account. Anybody can put events on the “ship to humio” CloudWatch 
   group, adhering to a specific event format, and the Lambda will ship the event for them. 
2. A separate Lambda gets created for each application. That Lambda reads from the CloudWatch group that the 
   application is already using. Somehow, the Lambda is configured to know how to translate those application log 
   events into a format that is consumable by Humio.
3. A middle-ground, where the account has a single Lambda that can be configured to read from any CloudWatch group and 
   translate application logs to Humio logs.
4. Infrastructure specific logging tools (i.e. Firelens for Fargate, Lambda Extensions)

## Decision

Option 2 because it is the easiest to implement initially and, since Lambda are priced per invocation, will cost the 
same even if duplicate Lambdas are made in each account for a different application.

## Pros and Cons

### Option 1

* Pro: less duplicate infrastructure.
* Pro: simple logging interface that's easily accessible in all accounts.
* Pro: minor application code and infrastructure changes are needed.
* Pro: can integrate with all types of infrastructure that can log to CloudWatch.
* Con: more complicated infrastructure upfront.
* Con: requires updates to other infrastructure to integrate with the new log group

### Option 2

* Pro: easier to manage the SubIdxNM
* Pro: simple logging interface that's easily accessible in all accounts.
* Pro: minor application code and infrastructure changes are needed.
* Pro: can integrate with all types of infrastructure that can log to CloudWatch.
* Pro: simple initial implementation
* Con: each log group must be added as a trigger (potentially many groups for distributed apps).
* Con: duplicate infrastructure since each account uses the same Lambda.

### Option 3

* Pro: simple logging interface that's easily accessible in all accounts.
* Pro: minor application code and infrastructure changes are needed.
* Pro: can integrate with all types of infrastructure that can log to CloudWatch.
* Con: Lambda permissions are not scoped.

### Option 4

* Pro: can use features more native to the functionality of the infrastructure.
* Con: requires a different implementation depending on the infrastructure being used.

## Roadmap

* Add KMS integration to support encrypted CloudWatch logs
* Add a global SSM parameter in ACS that includes a Humio connection string
* Consolidate duplicate Lambdas into a single function in ACS. Then change this module to crete Lambda triggers or 
  EventBridge rules that trigger the Lambda and inject the SubIdxNM for the application.
* Upgrade Lambda to support [unstructured data](https://docs.humio.com/reference/api/ingest/#parser)