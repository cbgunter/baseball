import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';

interface FrontendStackProps extends cdk.StackProps {
  domainName: string;
  subdomainName: string;
  adminEmail: string;
}

export class FrontendStack extends cdk.Stack {
  public readonly bucket: s3.Bucket;
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    // S3 Bucket for website hosting
    this.bucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: `baseball-bathroom-${this.account}`,
      publicReadAccess: false, // CloudFront OAI will handle access
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Keep bucket on stack deletion
      autoDeleteObjects: false,
      versioned: false,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    // Origin Access Identity for CloudFront
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(
      this,
      'WebsiteOAI',
      {
        comment: 'OAI for Baseball Bathroom Dictionary',
      }
    );

    // Grant CloudFront access to S3 bucket
    this.bucket.grantRead(originAccessIdentity);

    // Look up existing hosted zone
    const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: props.domainName,
    });

    // Create SSL certificate for the subdomain
    const certificate = new acm.Certificate(this, 'Certificate', {
      domainName: props.subdomainName,
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    // CloudFront Distribution
    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessIdentity(this.bucket, {
          originAccessIdentity,
        }),
        viewerProtocolPolicy:
          cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        compress: true,
      },
      domainNames: [props.subdomainName],
      certificate,
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5),
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5),
        },
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // Use only North America and Europe (cheapest)
      enabled: true,
      comment: 'Baseball Bathroom Dictionary CDN',
    });

    // Route 53 Alias Record
    new route53.ARecord(this, 'AliasRecord', {
      zone: hostedZone,
      recordName: props.subdomainName,
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(this.distribution)
      ),
    });

    // Outputs
    new cdk.CfnOutput(this, 'BucketName', {
      value: this.bucket.bucketName,
      description: 'S3 Bucket Name',
      exportName: 'BaseballBucketName',
    });

    new cdk.CfnOutput(this, 'DistributionId', {
      value: this.distribution.distributionId,
      description: 'CloudFront Distribution ID',
      exportName: 'BaseballDistributionId',
    });

    new cdk.CfnOutput(this, 'DistributionDomain', {
      value: this.distribution.distributionDomainName,
      description: 'CloudFront Distribution Domain',
    });

    new cdk.CfnOutput(this, 'WebsiteUrl', {
      value: `https://${props.subdomainName}`,
      description: 'Website URL',
    });
  }
}
