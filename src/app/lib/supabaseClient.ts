import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jjbxawdkitlvdlrmfbbc.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqYnhhd2RraXRsdmRscm1mYmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzExODExODEsImV4cCI6MjA0Njc1NzE4MX0.gVxIwwlXGXe1si6CwkZ4r6xShRimz7B93bnFn4wjrRw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
