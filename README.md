# セットリスト・ジェネレーター

音楽バンド向けのセットリスト作成・共有アプリケーションです。QRコードと画像ダウンロード機能を備えたセットリストを簡単に作成できます。

## 機能

- 📝 **セットリスト作成・編集**: バンド情報、イベント詳細、楽曲リストの管理
- 🎨 **複数テーマ**: "mqtn"、"basic"、"minimal"、"mqtn2"（mosquitone 2.0）の4つの表示テーマ
- 📱 **QRコード生成**: セットリスト共有用のQRコード自動生成
- 🖼️ **画像エクスポート**: セットリストを画像としてダウンロード
- 💾 **履歴管理**: 作成したセットリストの履歴をローカル保存
- 🔄 **自動保存**: フォームデータの自動保存でデータ紛失を防止
- 🔧 **デバッグモード**: 開発環境専用のライブプレビュー機能

## 技術スタック

### フロントエンド
- **React 18.3.1** + TypeScript
- **Vite 6.3.5** (ビルドツール)
- **React Router DOM 7.6.2** (ルーティング)
- **Semantic UI React** (UIコンポーネント)
- **Formik + Yup** (フォーム管理・バリデーション)

### バックエンド・インフラ
- **Vercel** (ホスティング)
- **Vercel KV** (Redis互換データベース)
- **Vercel Functions** (サーバーレスAPI)

### ユーティリティ
- **html2canvas** (画像生成)
- **qrcode** (QRコード生成)

## 開発環境のセットアップ

### 必要な環境
- Node.js 18以上
- pnpm (corepackで管理)

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/mosquitone/setlist-generator.git
cd setlist-generator

# 依存関係をインストール
pnpm install

# 環境変数を設定
cp .env.development .env.local
# .env.localファイルを編集してVercel KVの認証情報を設定
```

### 環境変数

`.env.local`ファイルに以下の環境変数を設定してください：

```
KV_REST_API_URL=your_vercel_kv_url
KV_REST_API_TOKEN=your_vercel_kv_token
KV_REST_API_READ_ONLY_TOKEN=your_vercel_kv_readonly_token
```

### 開発コマンド

```bash
# 開発サーバー起動（Vite）
pnpm start

# Vercelローカル開発環境起動（環境変数込み）
pnpm develop

# プロダクションビルド
pnpm build
```

## デプロイ

このアプリケーションはVercelでのデプロイを前提として設計されています。

1. Vercelアカウントでプロジェクトを作成
2. Vercel KVデータベースを設定
3. 環境変数を設定
4. GitHubリポジトリと連携してオートデプロイ

## アーキテクチャ

### データフロー
1. **フロントエンド**: React SPAでユーザーインターフェース
2. **API**: `/api/setlist`エンドポイントでCRUD操作
3. **データベース**: Vercel KVにHashSet形式でセットリストデータを保存
4. **ローカルストレージ**: フォームの自動保存と履歴管理

### セットリストデータ構造
```typescript
{
  meta: { createDate: string, version: string },
  band: { name: string },
  event: { 
    name: string, 
    date?: string, 
    openTime?: string, 
    startTime?: string 
  },
  playings: Array<{ 
    _id: string, 
    title: string, 
    note: string 
  }>,
  theme: "mqtn" | "basic" | "minimal" | "mqtn2"
}
```

## テーマ紹介

### mqtn2 (mosquitone 2.0)
- **最新テーマ**: モダンなダークデザイン
- **特徴**: グラスモーフィズム効果、動的フォントサイズ調整
- **最適化**: A4印刷対応、暗所での視認性向上
- **レイアウト**: 楽曲数に応じた最適な文字サイズとレイアウト

### その他のテーマ
- **mqtn**: 従来のmosquitoneスタイル
- **basic**: シンプルなホワイトテーマ  
- **minimal**: ミニマルデザイン

## テスト

### テスト構成
- **単体テスト**: 40テスト（API、コンポーネント、バリデーション）
- **E2Eテスト**: 5テスト（ユーザーフロー、フォーム検証）
- **カバレッジ**: 80%以上のコードカバレッジ目標

### テスト実行

```bash
# 単体テスト
pnpm test              # インタラクティブモード
pnpm test:run          # 一回実行
pnpm test:coverage     # カバレッジレポート付き

# E2Eテスト
pnpm test:e2e          # 全ブラウザ
pnpm test:e2e:chromium # Chromiumのみ
pnpm test:e2e:headed   # ブラウザ表示あり

# 全体テスト
pnpm test:all          # 単体 + E2E
pnpm test:ci           # CI/CD向け
```

### テスト技術
- **単体テスト**: Vitest + @testing-library/react
- **E2Eテスト**: Playwright (Chromium, Firefox, Safari)
- **モック**: API、DOM操作、外部ライブラリ
- **カバレッジ**: V8プロバイダー

詳細なテスト情報は [`test/README.md`](test/README.md) を参照してください。

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 開発者向け情報

詳細な開発ガイドラインとアーキテクチャ情報については、`CLAUDE.md`ファイルを参照してください。