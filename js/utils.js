// utils.js

// Session user (masih pakai sessionStorage lokal untuk login state)
const CURRENT_USER_KEY = "currentUser"

const setCurrentUser = user => sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
const getCurrentUser = ()   => JSON.parse(sessionStorage.getItem(CURRENT_USER_KEY))
const logout         = ()   => sessionStorage.removeItem(CURRENT_USER_KEY)

// Supabase init
const SUPABASE_URL = 'https://ryijghgahtvxhgvalgfs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5aWpnaGdhaHR2eGhndmFsZ2ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1Mzk1MDQsImV4cCI6MjA2NzExNTUwNH0.d41XVj29fy0yLwYDktMr8uLMM1NC3VkNq-Comcd4oYs';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ------------------------ AUTH ------------------------

async function loginUser(username, password) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .eq("password", password)
    .maybeSingle()

  if (error) {
    console.error("Login error:", error)
  }

  return data
}

async function registerUser(user) {
  const { error } = await supabase.from("users").insert(user)
  if (error) {
    console.error("Register error:", error)
    return false
  }
  return true
}

async function isUsernameTaken(username) {
  const { data } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .maybeSingle()

  return !!data
}

// ------------------------ FILES ------------------------

async function getFiles() {
  const { data, error } = await supabase
    .from("files")
    .select(`
      *,
      users (
        full_name
      )
    `)
    .order('id', { ascending: false });

  if (error) console.error("Gagal fetch files:", error);
  return data || [];
}


async function insertFile(file) {
  const { error } = await supabase.from("files").insert(file)
  if (error) console.error("Gagal insert file:", error)
}

async function updateFile(id, fileData) {
  const { error } = await supabase.from("files").update(fileData).eq("id", id)
  if (error) console.error("Gagal update file:", error)
}

async function deleteFile(id) {
  const { error } = await supabase.from("files").delete().eq("id", id)
  if (error) console.error("Gagal hapus file:", error)
}

async function getFileById(id) {
  const { data, error } = await supabase.from("files").select("*").eq("id", id).single()
  if (error) console.error("Gagal ambil file:", error)
  return data
}
