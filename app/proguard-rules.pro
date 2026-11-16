# Proguard rules for MessUP Android application

# Keep data models used by Firebase Firestore deserialization
-keep class com.example.messup.data.model.** { *; }
-keepclassmembers class com.example.messup.data.model.** {
    <fields>;
    <init>(...);
}

# Firebase & Play Services
-keepattributes *Annotation*
-dontwarn com.google.firebase.**
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
