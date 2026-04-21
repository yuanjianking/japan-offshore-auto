# HelloWorld Java 项目

## 项目概述
这是一个简单的Java程序，用于演示如何创建一个基本的Java类并打印"hello world"。

## 项目结构
```
sample/
├── com/
│   └── example/
│       └── HelloWorld.java
└── README.md
```

## 代码说明
### HelloWorld.java
- 包名：com.example
- 类名：HelloWorld
- 功能：包含main方法，打印"hello world"到控制台

## 编译和运行
### 编译
```bash
javac ./sample/com/example/HelloWorld.java
```

### 运行
```bash
java -cp ./sample com.example.HelloWorld
```

## 预期输出
```
hello world
```

## 环境要求
- Java 8 或更高版本
- 支持Java编译和运行的开发环境

## 注意事项
1. 确保Java环境已正确安装和配置
2. 编译时注意当前工作目录
3. 运行时需要指定类路径（-cp参数）