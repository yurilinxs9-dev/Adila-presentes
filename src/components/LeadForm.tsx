"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { User, Phone, ArrowRight, Loader2, Lock, CheckCircle } from "lucide-react";

const schema = z.object({
  nome_completo: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  celular: z
    .string()
    .regex(/^\(\d{2}\) \d{5}-\d{4}$/, "Formato: (XX) XXXXX-XXXX"),
});

type FormData = z.infer<typeof schema>;

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function LeadForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Erro ao cadastrar");
      }
      setStatus("success");
      setTimeout(() => {
        window.location.href = "https://chat.whatsapp.com/DfzeafadOra4uczlKwQz4I";
      }, 1500);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Erro inesperado. Tente novamente.");
    }
  };

  return (
    <section id="formulario" className="py-20 px-4">
      <div className="max-w-md mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-3xl md:text-4xl font-bold text-center mb-4"
        >
          GARANTA SEU <span className="text-adila">ACESSO VIP</span> AGORA
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-gray-400 text-center mb-8"
        >
          Preencha os dados e entre no grupo exclusivo
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8"
        >
          {status === "success" ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-xl font-bold text-green-400 mb-2">
                Cadastro realizado!
              </p>
              <p className="text-gray-400">Redirecionando para o grupo VIP...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    {...register("nome_completo")}
                    type="text"
                    placeholder="Seu nome completo"
                    className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-adila transition"
                  />
                </div>
                {errors.nome_completo && (
                  <p className="text-red-400 text-sm mt-1.5">{errors.nome_completo.message}</p>
                )}
              </div>

              <div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    {...register("celular")}
                    type="tel"
                    placeholder="(XX) XXXXX-XXXX"
                    onChange={(e) => {
                      const formatted = formatPhone(e.target.value);
                      setValue("celular", formatted, { shouldValidate: false });
                      e.target.value = formatted;
                    }}
                    className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-adila transition"
                  />
                </div>
                {errors.celular && (
                  <p className="text-red-400 text-sm mt-1.5">{errors.celular.message}</p>
                )}
              </div>

              {status === "error" && (
                <p className="text-red-400 text-sm text-center">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full btn-gradient text-white font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === "loading" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    ENTRAR NO GRUPO VIP
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}

          <p className="text-gray-600 text-xs text-center mt-5 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" /> Seus dados estão seguros
          </p>
        </motion.div>
      </div>
    </section>
  );
}
