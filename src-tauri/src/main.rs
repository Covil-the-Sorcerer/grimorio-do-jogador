// Evita abrir uma janela de terminal extra no Windows na versão final.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    grimorio_lib::run()
}
