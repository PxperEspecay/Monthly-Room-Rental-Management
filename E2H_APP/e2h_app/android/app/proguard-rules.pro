# ป้องกันการ obfuscate class ที่ใช้กับ Dio / OkHttp
-keep class dio.** { *; }
-keep class okhttp3.** { *; }
-keep class retrofit2.** { *; }
-keep class com.google.gson.** { *; }
-keepattributes Signature
-keepattributes *Annotation*