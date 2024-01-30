const path = require('path');

module.exports = {
  entry: './src/index.js', // 프로젝트의 진입점 파일
  output: {
    filename: 'bundle.js', // 빌드된 결과물의 파일명
    path: path.resolve(__dirname, 'dist'), // 빌드된 파일의 저장 경로
  },
  resolve: {
    fallback: {
      "querystring": require.resolve("querystring-es3")
    }
  },
  // 다양한 로더, 플러그인 등을 추가할 수 있음
  module: {
    rules: [
      // 로더 및 규칙 설정
      // 예: Babel을 사용하여 JavaScript 파일을 변환하는 규칙
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  // 플러그인 및 다양한 설정을 추가할 수 있음
  plugins: [
    // 예: 플러그인 설정
  ],
  // mode: 'development', // 또는 'production'
};