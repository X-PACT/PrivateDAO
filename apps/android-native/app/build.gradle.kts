plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.serialization")
    id("org.jetbrains.kotlin.plugin.compose")
}

import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import java.util.Properties

val releaseSigningProperties = Properties().apply {
    val signingFile = rootProject.file("release-signing.properties")
    if (signingFile.exists()) {
        signingFile.inputStream().use(::load)
    }
}

android {
    namespace = "io.xpact.privatedao.android"
    compileSdk = 36

    defaultConfig {
        applicationId = "io.xpact.privatedao.android"
        minSdk = 26
        targetSdk = 36
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables.useSupportLibrary = true
    }

    signingConfigs {
        create("release") {
            val storeFilePath = providers.environmentVariable("PRIVATEDAO_RELEASE_STORE_FILE")
                .orElse(releaseSigningProperties.getProperty("storeFile") ?: "")
                .get()
            val storePassword = providers.environmentVariable("PRIVATEDAO_RELEASE_STORE_PASSWORD")
                .orElse(releaseSigningProperties.getProperty("storePassword") ?: "")
                .get()
            val keyAlias = providers.environmentVariable("PRIVATEDAO_RELEASE_KEY_ALIAS")
                .orElse(releaseSigningProperties.getProperty("keyAlias") ?: "")
                .get()
            val keyPassword = providers.environmentVariable("PRIVATEDAO_RELEASE_KEY_PASSWORD")
                .orElse(releaseSigningProperties.getProperty("keyPassword") ?: "")
                .get()

            if (storeFilePath.isNotBlank() && storePassword.isNotBlank() && keyAlias.isNotBlank() && keyPassword.isNotBlank()) {
                storeFile = file(storeFilePath)
                this.storePassword = storePassword
                this.keyAlias = keyAlias
                this.keyPassword = keyPassword
                enableV1Signing = true
                enableV2Signing = true
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("release")
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro",
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
            excludes += "META-INF/versions/9/OSGI-INF/MANIFEST.MF"
        }
    }
}

dependencies {
    val composeBom = platform("androidx.compose:compose-bom:2026.02.01")

    implementation(composeBom)
    androidTestImplementation(composeBom)

    implementation("androidx.core:core-ktx:1.18.0")
    implementation("androidx.activity:activity-compose:1.10.1")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.10.0")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.10.0")
    implementation("androidx.navigation:navigation-compose:2.9.0")
    implementation("com.google.android.material:material:1.13.0")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.foundation:foundation")

    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.10.2")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.9.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("org.bouncycastle:bcprov-jdk18on:1.83")

    implementation("com.solanamobile:mobile-wallet-adapter-clientlib-ktx:2.0.7")

    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}

kotlin {
    compilerOptions {
        jvmTarget.set(JvmTarget.JVM_17)
    }
}
