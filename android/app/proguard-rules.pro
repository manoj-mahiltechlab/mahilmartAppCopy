# ========== React Native Core ==========
-keep class com.facebook.react.** { *; }
-dontwarn com.facebook.react.**

# ========== Razorpay ==========
-keep class com.razorpay.** { *; }
-dontwarn com.razorpay.**

# Razorpay missing annotations fix
-dontwarn proguard.annotation.Keep
-dontwarn proguard.annotation.KeepClassMembers

# ========== Twilio (if used) ==========
-keep class com.twilio.** { *; }
-dontwarn com.twilio.**

# ========== Retrofit / Gson (if used) ==========
-keep class retrofit2.** { *; }
-dontwarn retrofit2.**
-keep class com.google.gson.** { *; }
-dontwarn com.google.gson.**

# ========== Vector Icons ==========
-keep class com.oblador.vectoricons.** { *; }
-dontwarn com.oblador.vectoricons.**

# ========== Java Annotations (safe fallback) ==========
-keepattributes *Annotation*

# ========== Prevent stripping of Application class ==========
-keep class **.MainApplication { *; }

# ========== Keep all Activities ==========
-keep class * extends android.app.Activity
-keep class * extends androidx.appcompat.app.AppCompatActivity
# ===== Google Play Services Location (FusedLocationProviderClient) =====
-keep class com.google.android.gms.location.** { *; }
-dontwarn com.google.android.gms.location.**

# ===== AndroidX WorkManager =====
-keep class androidx.work.impl.** { *; }
-dontwarn androidx.work.**

# ===== AndroidX App Startup (used by WorkManager) =====
-keep class androidx.startup.** { *; }
-dontwarn androidx.startup.**
