# Build the app and publish it to the vamsicloud.com S3 bucket + CloudFront.
# Requires: AWS CLI v2 configured (aws configure) with access to the bucket.
$ErrorActionPreference = "Stop"
$Bucket = "vamsicloud.com"
$DistributionId = "E35C1B0FS72R4P"

function Check($step) { if ($LASTEXITCODE -ne 0) { throw "$step failed" } }

npm run build; Check "Build"

# Hashed JS/CSS/images: cache for a year. --delete removes old bundles in assets/ only.
aws s3 sync dist/assets "s3://$Bucket/assets" --delete --cache-control "public,max-age=31536000,immutable"; Check "Asset upload"

# index.html: always revalidate so visitors get the new bundle right away.
aws s3 cp dist/index.html "s3://$Bucket/index.html" --cache-control "no-cache" --content-type "text/html; charset=utf-8"; Check "index.html upload"

aws cloudfront create-invalidation --distribution-id $DistributionId --paths "/" "/index.html"; Check "CloudFront invalidation"

Write-Host "Deployed to https://vamsicloud.com" -ForegroundColor Green
