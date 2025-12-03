# ⚾ Baseball Bathroom Dictionary

A humorous website mapping baseball terms to bathroom analogies. Built with Vite, vanilla JavaScript, and deployed on AWS with low-cost infrastructure.

## 🏗️ Architecture

- **Frontend**: Vite + Vanilla JavaScript (static site)
- **Hosting**: AWS S3 + CloudFront CDN
- **DNS**: Route 53 (baseball.caseyhunter.net)
- **Backend**: API Gateway + Lambda + DynamoDB (Phase 2)
- **CI/CD**: GitHub Actions
- **Estimated Cost**: $2-5/month

## 📁 Project Structure

```
baseball/
├── frontend/                  # Vite frontend application
│   ├── src/
│   │   ├── main.js           # Main app logic
│   │   ├── api.js            # API client
│   │   ├── components/       # Reusable components
│   │   ├── admin/            # Admin dashboard
│   │   └── styles/           # CSS files
│   ├── public/
│   ├── index.html            # Main page
│   └── admin.html            # Admin page
├── backend/                   # Lambda functions (Phase 2)
├── infrastructure/            # AWS CDK infrastructure
│   ├── lib/                  # CDK stacks
│   └── bin/                  # CDK app entry
└── .github/workflows/         # GitHub Actions CI/CD
```

## 🚀 Local Development

### Prerequisites

- Node.js 20.x or later
- npm
- AWS CLI (for deployment)
- AWS CDK CLI: `npm install -g aws-cdk`

### Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open browser**:
   - Main site: http://localhost:3000
   - Admin page: http://localhost:3000/admin.html

### Development Mode

In development mode, the app uses mock data defined in `frontend/src/api.js`. The admin page accepts any API key for testing.

## 🏗️ Deployment

### First-Time Setup

1. **Configure AWS credentials**:
   ```bash
   aws configure
   ```

2. **Bootstrap CDK** (one-time, per AWS account/region):
   ```bash
   cd infrastructure
   npx cdk bootstrap aws://ACCOUNT-ID/us-east-1
   ```

3. **Set up GitHub Secrets**:
   Go to your repository settings and add:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `ADMIN_API_KEY` (generate a secure random string)

### Manual Deployment

1. **Build frontend**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy infrastructure**:
   ```bash
   cd infrastructure
   npm run deploy
   ```

3. **Upload frontend to S3**:
   ```bash
   aws s3 sync ./frontend/dist s3://YOUR-BUCKET-NAME --delete
   aws cloudfront create-invalidation --distribution-id YOUR-DIST-ID --paths "/*"
   ```

### Automated Deployment (GitHub Actions)

Push to the `main` branch to trigger automatic deployment:

```bash
git add .
git commit -m "Deploy updates"
git push origin main
```

The GitHub Actions workflow will:
1. Build the frontend
2. Deploy CDK infrastructure
3. Sync files to S3
4. Invalidate CloudFront cache

## 🎨 Features

### Phase 1 (Current)
- ✅ Static website with baseball theme
- ✅ Searchable table of baseball terms
- ✅ Category filtering (7 baseball-centric categories)
- ✅ Submission form UI (mock backend)
- ✅ Admin page UI (mock backend)
- ✅ S3 + CloudFront + Route 53 hosting
- ✅ GitHub Actions CI/CD

### Phase 2 (Next)
- [ ] DynamoDB database
- [ ] Lambda functions for API
- [ ] Real form submissions
- [ ] Email notifications (SES)
- [ ] Connect frontend to real API

### Phase 3
- [ ] Admin authentication
- [ ] Approve/reject submissions
- [ ] DynamoDB transactions

### Phase 4
- [ ] Enhanced search (highlighting, debouncing)
- [ ] Responsive design polish
- [ ] Accessibility improvements
- [ ] Performance optimization

## 🎨 Design System

### Color Scheme
- **Primary Navy**: `#002244` (backgrounds, headers)
- **Primary Red**: `#DC143C` (buttons, accents)
- **Accent White**: `#FFFFFF` (text, cards)
- **Field Green**: `#228B22` (success states)
- **Dirt Brown**: `#8B4513` (borders)
- **Warning Yellow**: `#FFD700` (highlights)

### Categories
1. **Scoring Plays** - Home runs, singles, etc.
2. **Base Running** - Stealing bases, walks
3. **On the Mound** - Pitching terms
4. **Positions & Equipment** - Catcher, dugout, etc.
5. **Game Day** - Rain delays, extra innings
6. **Plays & Calls** - Foul balls, errors
7. **The Stat Sheet** - Batting average, ERA

## 🛠️ Available Scripts

### Root
- `npm run dev` - Start frontend dev server
- `npm run build` - Build frontend for production
- `npm run deploy` - Deploy infrastructure with CDK

### Frontend
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Infrastructure
- `npm run build` - Compile TypeScript
- `npm run deploy` - Deploy all stacks
- `npm run diff` - Show stack differences
- `npm run synth` - Synthesize CloudFormation template

## 📝 Environment Variables

### Frontend (`.env`)
```env
VITE_API_URL=https://baseball.caseyhunter.net/api
```

### Infrastructure (GitHub Secrets)
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `ADMIN_API_KEY` - Admin authentication key

## 🔒 Security

- S3 bucket is private (CloudFront OAI for access)
- HTTPS enforced via CloudFront
- Admin endpoints require API key validation
- Rate limiting on API Gateway (Phase 2)
- Input validation and XSS prevention
- CORS restricted to domain

## 📊 Cost Breakdown

**Monthly Estimate**: $2-5

- **S3**: ~$0.50 (storage + requests)
- **CloudFront**: ~$1-2 (first 1TB free)
- **Route 53**: ~$0.50 (hosted zone)
- **API Gateway**: ~$0.20 (HTTP API, Phase 2)
- **Lambda**: Free tier (1M requests/month)
- **DynamoDB**: ~$0.25 (on-demand, Phase 2)
- **SES**: Free tier (Phase 2)

## 🚨 Troubleshooting

### CloudFront shows old content
Invalidate the cache:
```bash
aws cloudfront create-invalidation --distribution-id YOUR-ID --paths "/*"
```

### CDK deployment fails
Ensure you're in the correct region:
```bash
export AWS_REGION=us-east-1
```

### Local dev server won't start
Check if port 3000 is available:
```bash
lsof -i :3000
kill -9 <PID>
```

## 📚 Resources

- [Vite Documentation](https://vitejs.dev/)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [CloudFront Pricing](https://aws.amazon.com/cloudfront/pricing/)

## 👤 Author

**Casey Hunter**
- Email: cbgunter@gmail.com
- Domain: caseyhunter.net

## 📄 License

MIT License - This is a humor project for entertainment purposes.
