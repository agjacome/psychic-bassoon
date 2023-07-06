{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/release-23.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
  }:

  flake-utils.lib.eachDefaultSystem(system:
    let
      pkgs = import nixpkgs { inherit system; };
    in {
      devShells.default = pkgs.mkShell {
        buildInputs = [
          pkgs.git
          pkgs.nodejs_20
          pkgs.nodePackages.pnpm
          pkgs.nodePackages.prettier
          pkgs.nodePackages.typescript
          pkgs.nodePackages.typescript-language-server
          pkgs.sqlite
        ];
      };
    }
  );
}
