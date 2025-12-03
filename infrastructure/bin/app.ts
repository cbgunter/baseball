#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { FrontendStack } from '../lib/frontend-stack';

const app = new cdk.App();

// Environment configuration
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: 'us-east-1', // Required for CloudFront and Route 53
};

// Configuration
const config = {
  domainName: 'caseyhunter.net',
  // We'll create a subdomain for the baseball app
  subdomainName: 'baseball.caseyhunter.net',
  adminEmail: 'cbgunter@gmail.com',
};

// Create frontend stack (S3 + CloudFront + Route 53)
new FrontendStack(app, 'BaseballFrontendStack', {
  env,
  description: 'Baseball Bathroom Dictionary - Frontend Infrastructure',
  ...config,
});

app.synth();
