use std::fs;
use std::io::ErrorKind;
use std::path::{Component, Path, PathBuf};

use tauri::{AppHandle, Manager};

// Todos os dados do usuário ficam em uma única pasta do app
// (no Windows: %APPDATA%\com.grimorio.jogador). Os comandos abaixo só mexem dentro dela.

fn pasta_de_dados(app: &AppHandle) -> Result<PathBuf, String> {
    let pasta = app.path().app_data_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&pasta).map_err(|e| e.to_string())?;
    Ok(pasta)
}

// Aceita só caminhos relativos simples (ex.: "fichas/abc.json").
// Recusa "..", letras de unidade e caminhos absolutos, para nunca sair da pasta de dados.
fn caminho_seguro(app: &AppHandle, relativo: &str) -> Result<PathBuf, String> {
    if relativo.is_empty() {
        return Err("Caminho vazio.".to_string());
    }
    let caminho = Path::new(relativo);
    for parte in caminho.components() {
        match parte {
            Component::Normal(_) => {}
            _ => return Err(format!("Caminho inválido: {}", relativo)),
        }
    }
    Ok(pasta_de_dados(app)?.join(caminho))
}

#[tauri::command]
fn caminho_dados(app: AppHandle) -> Result<String, String> {
    Ok(pasta_de_dados(&app)?.to_string_lossy().to_string())
}

#[tauri::command]
fn ler_arquivo(app: AppHandle, caminho: String) -> Result<Option<String>, String> {
    let alvo = caminho_seguro(&app, &caminho)?;
    match fs::read_to_string(&alvo) {
        Ok(texto) => Ok(Some(texto)),
        Err(e) if e.kind() == ErrorKind::NotFound => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

// Gravação segura: escreve em um arquivo temporário e só depois troca pelo definitivo,
// para um desligamento no meio da gravação não deixar o arquivo pela metade.
#[tauri::command]
fn gravar_arquivo(app: AppHandle, caminho: String, conteudo: String) -> Result<(), String> {
    let alvo = caminho_seguro(&app, &caminho)?;
    if let Some(pai) = alvo.parent() {
        fs::create_dir_all(pai).map_err(|e| e.to_string())?;
    }
    let mut nome_temporario = alvo.clone().into_os_string();
    nome_temporario.push(".tmp");
    let temporario = PathBuf::from(nome_temporario);
    fs::write(&temporario, conteudo).map_err(|e| e.to_string())?;
    fs::rename(&temporario, &alvo).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn listar_arquivos(app: AppHandle, pasta: String) -> Result<Vec<String>, String> {
    let alvo = caminho_seguro(&app, &pasta)?;
    if !alvo.exists() {
        return Ok(Vec::new());
    }
    let mut nomes: Vec<String> = Vec::new();
    for entrada in fs::read_dir(&alvo).map_err(|e| e.to_string())? {
        let entrada = entrada.map_err(|e| e.to_string())?;
        if entrada.path().is_file() {
            if let Some(nome) = entrada.file_name().to_str() {
                nomes.push(nome.to_string());
            }
        }
    }
    nomes.sort();
    Ok(nomes)
}

#[tauri::command]
fn apagar_arquivo(app: AppHandle, caminho: String) -> Result<(), String> {
    let alvo = caminho_seguro(&app, &caminho)?;
    match fs::remove_file(&alvo) {
        Ok(()) => Ok(()),
        Err(e) if e.kind() == ErrorKind::NotFound => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            caminho_dados,
            ler_arquivo,
            gravar_arquivo,
            listar_arquivos,
            apagar_arquivo
        ])
        .run(tauri::generate_context!())
        .expect("erro ao iniciar o Grimório do Jogador");
}
